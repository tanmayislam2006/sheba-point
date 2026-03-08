export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Matches backend sendResponse JSON shape.
export type ApiResponse<T> = {
  status?: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
};

