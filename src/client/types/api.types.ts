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
