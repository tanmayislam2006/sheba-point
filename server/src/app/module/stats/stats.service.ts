import status from "http-status";
import { PaymentStatus, Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../libs/prisma";
import AppError from "../../shared/appError";
import { IRequestUser } from "../admin/admin.interface";

type DashboardRange = "7d" | "30d" | "90d" | "1y";
type ChartGroupBy = "day" | "week" | "month";

interface IStatsQuery {
  range?: string;
  groupBy?: string;
  limit?: string | number;
}

interface IUserScope {
  doctorId?: string;
  patientId?: string;
}

interface IChartPoint {
  period: string;
  value: number;
}

const validRanges: DashboardRange[] = ["7d", "30d", "90d", "1y"];
const validGroupBy: ChartGroupBy[] = ["day", "week", "month"];

const normalizeRange = (range?: string): DashboardRange => {
  if (range && validRanges.includes(range as DashboardRange)) {
    return range as DashboardRange;
  }

  return "30d";
};

const normalizeGroupBy = (groupBy?: string): ChartGroupBy => {
  if (groupBy && validGroupBy.includes(groupBy as ChartGroupBy)) {
    return groupBy as ChartGroupBy;
  }

  return "month";
};

const parseLimit = (limit?: string | number) => {
  const parsed = Number(limit);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 20;
  }

  return Math.min(parsed, 100);
};

const getRangeStart = (range: DashboardRange) => {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "7d":
      start.setDate(now.getDate() - 7);
      return start;
    case "30d":
      start.setDate(now.getDate() - 30);
      return start;
    case "90d":
      start.setDate(now.getDate() - 90);
      return start;
    case "1y":
      start.setFullYear(now.getFullYear() - 1);
      return start;
    default:
      return start;
  }
};

const toDayKey = (date: Date) => date.toISOString().slice(0, 10);
const toMonthKey = (date: Date) => date.toISOString().slice(0, 7);

const getWeekStartDate = (date: Date) => {
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = (utcDate.getUTCDay() + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - day);

  return utcDate;
};

const toWeekKey = (date: Date) => toDayKey(getWeekStartDate(date));

const getPeriodKey = (date: Date, groupBy: ChartGroupBy) => {
  if (groupBy === "day") {
    return toDayKey(date);
  }

  if (groupBy === "week") {
    return toWeekKey(date);
  }

  return toMonthKey(date);
};

const buildTimeSeries = <T>(
  items: T[],
  groupBy: ChartGroupBy,
  getCreatedAt: (item: T) => Date,
  getValue: (item: T) => number,
): IChartPoint[] => {
  const bucketMap = new Map<string, number>();

  for (const item of items) {
    const key = getPeriodKey(getCreatedAt(item), groupBy);
    const value = getValue(item);
    bucketMap.set(key, (bucketMap.get(key) ?? 0) + value);
  }

  return [...bucketMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, value }));
};

const getUserScope = async (user: IRequestUser): Promise<IUserScope> => {
  if (user.role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
      select: { id: true },
    });

    return { doctorId: doctor.id };
  }

  if (user.role === Role.PATIENT) {
    const patient = await prisma.patient.findUniqueOrThrow({
      where: {
        email: user.email,
      },
      select: { id: true },
    });

    return { patientId: patient.id };
  }

  return {};
};

const getAppointmentWhere = (scope: IUserScope, startDate: Date) => {
  return {
    createdAt: {
      gte: startDate,
    },
    ...(scope.doctorId ? { doctorId: scope.doctorId } : {}),
    ...(scope.patientId ? { patientId: scope.patientId } : {}),
  };
};

const getPaymentWhere = (scope: IUserScope, startDate: Date) => {
  return {
    createdAt: {
      gte: startDate,
    },
    status: PaymentStatus.PAID,
    appointment: {
      ...(scope.doctorId ? { doctorId: scope.doctorId } : {}),
      ...(scope.patientId ? { patientId: scope.patientId } : {}),
    },
  };
};

const getDashboardStatsData = async (user: IRequestUser, query: IStatsQuery) => {
  const range = normalizeRange(query.range);
  const groupBy = normalizeGroupBy(query.groupBy);
  const limit = parseLimit(query.limit);

  const [kpi, appointmentChartData, revenueChartData, recentActivities] =
    await Promise.all([
      getDashboardKpi(user, { range }),
      getAppointmentChartData(user, { range, groupBy }),
      getRevenueChartData(user, { range, groupBy }),
      getRecentActivities(user, { limit }),
    ]);

  return {
    ...kpi,
    appointmentChartData,
    revenueChartData,
    recentActivities,
  };
};

const getDashboardKpi = async (user: IRequestUser, query: IStatsQuery) => {
  const range = normalizeRange(query.range);
  const startDate = getRangeStart(range);

  switch (user.role) {
    case Role.SUPER_ADMIN:
      return getSuperAdminKpi(startDate);
    case Role.ADMIN:
      return getAdminKpi(startDate);
    case Role.DOCTOR:
      return getDoctorKpi(user, startDate);
    case Role.PATIENT:
      return getPatientKpi(user, startDate);
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
};

const getSuperAdminKpi = async (startDate: Date) => {
  const [
    appointmentCount,
    doctorCount,
    patientCount,
    superAdminCount,
    adminCount,
    paymentCount,
    userCount,
    blockedUserCount,
    newUserCount,
    totalRevenue,
    pieChartData,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.doctor.count({ where: { isDeleted: false } }),
    prisma.patient.count({ where: { isDeleted: false } }),
    prisma.admin.count({
      where: {
        user: {
          role: Role.SUPER_ADMIN,
          isDeleted: false,
        },
      },
    }),
    prisma.admin.count({
      where: {
        user: {
          role: Role.ADMIN,
          isDeleted: false,
        },
      },
    }),
    prisma.payment.count(),
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { status: UserStatus.BLOCKED, isDeleted: false } }),
    prisma.user.count({
      where: {
        createdAt: { gte: startDate },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
      },
    }),
    getAppointmentStatusDistribution({}),
  ]);

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    superAdminCount,
    adminCount,
    paymentCount,
    userCount,
    blockedUserCount,
    newUserCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    appointmentStatusDistribution: pieChartData,
  };
};

const getAdminKpi = async (startDate: Date) => {
  const [
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    userCount,
    totalRevenue,
    newDoctorCount,
    newPatientCount,
    appointmentStatusDistribution,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.doctor.count({ where: { isDeleted: false } }),
    prisma.patient.count({ where: { isDeleted: false } }),
    prisma.payment.count(),
    prisma.user.count({
      where: {
        isDeleted: false,
        role: {
          in: [Role.DOCTOR, Role.PATIENT],
        },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
      },
    }),
    prisma.doctor.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    prisma.patient.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    getAppointmentStatusDistribution({}),
  ]);

  return {
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    userCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    newDoctorCount,
    newPatientCount,
    appointmentStatusDistribution,
  };
};

const getDoctorKpi = async (user: IRequestUser, startDate: Date) => {
  const scope = await getUserScope(user);

  const appointmentWhere = getAppointmentWhere(scope, startDate);
  const paymentWhere = getPaymentWhere(scope, startDate);

  const [reviewCount, patientCount, appointmentCount, totalRevenue, statusGroups] =
    await Promise.all([
      prisma.review.count({
        where: {
          doctorId: scope.doctorId,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.appointment.groupBy({
        by: ["patientId"],
        where: appointmentWhere,
      }),
      prisma.appointment.count({
        where: appointmentWhere,
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: paymentWhere,
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        where: appointmentWhere,
      }),
    ]);

  return {
    reviewCount,
    patientCount: patientCount.length,
    appointmentCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    appointmentStatusDistribution: statusGroups.map(({ _count, status }) => ({
      status,
      count: _count.id,
    })),
  };
};

const getPatientKpi = async (user: IRequestUser, startDate: Date) => {
  const scope = await getUserScope(user);

  const appointmentWhere = getAppointmentWhere(scope, startDate);
  const paymentWhere = getPaymentWhere(scope, startDate);

  const [appointmentCount, reviewCount, amountSpent, statusGroups] =
    await Promise.all([
      prisma.appointment.count({
        where: appointmentWhere,
      }),
      prisma.review.count({
        where: {
          patientId: scope.patientId,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: paymentWhere,
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
        where: appointmentWhere,
      }),
    ]);

  return {
    appointmentCount,
    reviewCount,
    amountSpent: amountSpent._sum.amount || 0,
    appointmentStatusDistribution: statusGroups.map(({ _count, status }) => ({
      status,
      count: _count.id,
    })),
  };
};

const getAppointmentStatusDistribution = async (scope: IUserScope) => {
  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
    where: {
      ...(scope.doctorId ? { doctorId: scope.doctorId } : {}),
      ...(scope.patientId ? { patientId: scope.patientId } : {}),
    },
  });

  return appointmentStatusDistribution.map(({ _count, status }) => ({
    status,
    count: _count.id,
  }));
};

const getAppointmentChartData = async (
  user: IRequestUser,
  query: IStatsQuery,
) => {
  const range = normalizeRange(query.range);
  const groupBy = normalizeGroupBy(query.groupBy);
  const startDate = getRangeStart(range);
  const scope = await getUserScope(user);

  const appointments = await prisma.appointment.findMany({
    where: getAppointmentWhere(scope, startDate),
    select: {
      createdAt: true,
    },
  });

  return buildTimeSeries(
    appointments,
    groupBy,
    (item) => item.createdAt,
    () => 1,
  );
};

const getRevenueChartData = async (user: IRequestUser, query: IStatsQuery) => {
  const range = normalizeRange(query.range);
  const groupBy = normalizeGroupBy(query.groupBy);
  const startDate = getRangeStart(range);
  const scope = await getUserScope(user);

  const payments = await prisma.payment.findMany({
    where: getPaymentWhere(scope, startDate),
    select: {
      createdAt: true,
      amount: true,
    },
  });

  return buildTimeSeries(
    payments,
    groupBy,
    (item) => item.createdAt,
    (item) => item.amount,
  );
};

const getRecentActivities = async (user: IRequestUser, query: IStatsQuery) => {
  const limit = parseLimit(query.limit);
  const scope = await getUserScope(user);

  const appointmentWhere = {
    ...(scope.doctorId ? { doctorId: scope.doctorId } : {}),
    ...(scope.patientId ? { patientId: scope.patientId } : {}),
  };

  const paymentWhere = {
    ...(scope.doctorId ? { appointment: { doctorId: scope.doctorId } } : {}),
    ...(scope.patientId ? { appointment: { patientId: scope.patientId } } : {}),
  };

  const [appointments, payments, users, reviews] = await Promise.all([
    prisma.appointment.findMany({
      where: appointmentWhere,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        status: true,
        createdAt: true,
        patient: {
          select: {
            name: true,
          },
        },
        doctor: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        ...paymentWhere,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
    user.role === Role.SUPER_ADMIN || user.role === Role.ADMIN
      ? prisma.user.findMany({
          where: {
            ...(user.role === Role.ADMIN
              ? {
                  role: {
                    in: [Role.DOCTOR, Role.PATIENT],
                  },
                }
              : {}),
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          select: {
            id: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    prisma.review.findMany({
      where: {
        ...(scope.doctorId ? { doctorId: scope.doctorId } : {}),
        ...(scope.patientId ? { patientId: scope.patientId } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        rating: true,
        createdAt: true,
      },
    }),
  ]);

  const appointmentActivities = appointments.map((item) => ({
    id: item.id,
    type: "APPOINTMENT",
    title: `Appointment ${item.status}`,
    message: `${item.patient.name} with Dr. ${item.doctor.name}`,
    createdAt: item.createdAt,
  }));

  const paymentActivities = payments.map((item) => ({
    id: item.id,
    type: "PAYMENT",
    title: `Payment ${item.status}`,
    message: `Amount ${item.amount}`,
    createdAt: item.createdAt,
  }));

  const userActivities = users.map((item) => ({
    id: item.id,
    type: "USER",
    title: `${item.role} account created`,
    message: `${item.name} (${item.status})`,
    createdAt: item.createdAt,
  }));

  const reviewActivities = reviews.map((item) => ({
    id: item.id,
    type: "REVIEW",
    title: "New review",
    message: `Rating ${item.rating}`,
    createdAt: item.createdAt,
  }));

  return [
    ...appointmentActivities,
    ...paymentActivities,
    ...userActivities,
    ...reviewActivities,
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const statsService = {
  getDashboardStatsData,
  getDashboardKpi,
  getAppointmentChartData,
  getRevenueChartData,
  getRecentActivities,
};
