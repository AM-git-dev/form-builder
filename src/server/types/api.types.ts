export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function formatResponse<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return { data, meta, error: null };
}

export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): ApiResponse<T[]> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    error: null,
  };
}
