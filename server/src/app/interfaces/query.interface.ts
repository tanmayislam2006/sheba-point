/*
prisma.doctor.findMany({
  where: {
    appointmentFee: { lt: 100 },
    user: {
      name: { contains: "john", mode: "insensitive" }
    }
  },
  include: {
    user: true,
    specialties: true
  },
  orderBy: {
    createdAt: "desc"
  },
  skip: 0,
  take: 10
});
*/
// prisma.model.findMany({...})
export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean | Record<string, unknown>>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
  distinct?: string[] | string;
  [key: string]: unknown;
}
// GET /doctors?searchTerm=john&page=1&limit=10
export interface IQueryParams {
  searchTerm?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  fields?: string;
  includes?: string;
  [key: string]: string | undefined;
}

/*
const doctorQueryConfig: IQueryConfig = {
  searchableFields: [
    "user.name",
    "user.email",
    "specialties.specialty.title",
    "specialties.specialty.description"
  ],
  filterableFields: [
    "appointmentFee",
    "specialties.specialty.title"
  ]
};
*/
export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}
