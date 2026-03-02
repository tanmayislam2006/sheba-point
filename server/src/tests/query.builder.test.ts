import test from "node:test";
import assert from "node:assert/strict";
import { QueryBuilder } from "../app/utils/query";

class MockModelDelegate {
  public lastFindManyArgs: Record<string, unknown> = {};
  public lastCountArgs: Record<string, unknown> = {};

  constructor(
    private readonly data: Record<string, unknown>[] = [],
    private readonly total = 0,
  ) {}

  async findMany(args?: Record<string, unknown>) {
    this.lastFindManyArgs = args ?? {};
    return this.data;
  }

  async count(args?: Record<string, unknown>) {
    this.lastCountArgs = args ?? {};
    return this.total;
  }
}

test("search builds OR conditions for direct and nested fields", async () => {
  const model = new MockModelDelegate([], 0);
  const qb = new QueryBuilder(
    model,
    { searchTerm: "cardio" },
    {
      searchableFields: ["name", "specialties.specialty.title"],
    },
  );

  await qb.search().execute();

  const where = model.lastFindManyArgs.where as Record<string, unknown>;
  assert.ok(Array.isArray(where.OR));
  assert.deepEqual(where.OR, [
    { name: { contains: "cardio", mode: "insensitive" } },
    {
      specialties: {
        some: {
          specialty: { title: { contains: "cardio", mode: "insensitive" } },
        },
      },
    },
  ]);
});

test("filter parses scalar, range, and 3-level nested values", () => {
  const model = new MockModelDelegate([], 0);
  const qb = new QueryBuilder(
    model,
    {
      gender: "MALE",
      appointmentFee: { gte: "50", lte: "100" } as unknown as string,
      "specialties.specialty.title": "Cardiology",
    },
    {
      filterableFields: ["gender", "appointmentFee", "specialties.specialty.title"],
    },
  );

  qb.filter();
  const query = qb.getQuery();
  const where = query.where as Record<string, unknown>;

  assert.equal(where.gender, "MALE");
  assert.deepEqual(where.appointmentFee, { gte: 50, lte: 100 });
  assert.deepEqual(where.specialties, {
    some: {
      specialty: {
        title: "Cardiology",
      },
    },
  });
});

test("sort, paginate and fields produce expected findMany args", async () => {
  const model = new MockModelDelegate([], 11);
  const qb = new QueryBuilder(
    model,
    {
      sortBy: "user.name",
      sortOrder: "asc",
      page: "2",
      limit: "5",
      fields: "id,name,email",
    },
    {},
  );

  const result = await qb.sort().paginate().fields().execute();

  assert.deepEqual(model.lastFindManyArgs.orderBy, { user: { name: "asc" } });
  assert.equal(model.lastFindManyArgs.skip, 5);
  assert.equal(model.lastFindManyArgs.take, 5);
  assert.deepEqual(model.lastFindManyArgs.select, {
    id: true,
    name: true,
    email: true,
  });
  assert.equal(model.lastFindManyArgs.include, undefined);
  assert.equal(result.meta.totalPages, 3);
});

test("dynamicInclude only accepts configured include keys", () => {
  const model = new MockModelDelegate([], 0);
  const qb = new QueryBuilder(
    model,
    { include: "user,reviews,notAllowed" },
    {},
  );

  qb.dynamicInclude(
    {
      user: true,
      reviews: true,
    },
    ["user"],
  );

  const query = qb.getQuery();
  assert.deepEqual(query.include, {
    user: true,
    reviews: true,
  });
});
