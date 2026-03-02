import { PrismaFindManyArgs } from "../interfaces/query.interface";

export class QueryBuilder<T> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaFindManyArgs;

  constructor(
    private model: {
      findMany: (args?: any) => Promise<T[]>;
      count: (args?: any) => Promise<number>;
    },
    private queryParams: Record<string, any>,
    private config: {
      searchableFields?: string[];
    } = {}
  ) {
    this.query = {
      where: {},
    };

    this.countQuery = {
      where: {},
    };
  }

  // 🔍 SEARCH METHOD ONLY
  search(): this {
    const searchTerm = this.queryParams.searchTerm;
    const searchableFields = this.config.searchableFields;

    // If no search term or no searchable fields → do nothing
    if (!searchTerm || !searchableFields?.length) {
      return this;
    }

    // Build OR conditions
    const searchConditions = searchableFields.map((field) => {

      // If relation field (like user.name)
      if (field.includes(".")) {
        const parts = field.split(".");

        // relation.field (2 level)
        if (parts.length === 2) {
          const [relation, nestedField] = parts;

          return {
            [relation]: {
              [nestedField]: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          };
        }

        // relation.nestedRelation.field (3 level)
        if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;

          return {
            [relation]: {
              some: {
                [nestedRelation]: {
                  [nestedField]: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
          };
        }
      }

      // Direct field (like name)
      return {
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      };
    });

    // Attach OR condition
    (this.query.where as any).OR = searchConditions;
    (this.countQuery.where as any).OR = searchConditions;

    return this;
  }

}