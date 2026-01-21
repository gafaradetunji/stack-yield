export interface ApiSuccessResponse<T> {
  status: 'success';
  data: T;
}

export interface ApiErrorResponse {
  status: 'error';
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    status: 'success',
    data,
  };
}

export function errorResponse(message: string, code?: string): ApiErrorResponse {
  return {
    status: 'error',
    error: {
      message,
      code,
    },
  };
}
