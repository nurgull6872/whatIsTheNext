import { AxiosError } from 'axios';

// Backend'in hata govdesi (PROJE_PLANI.md §5.3):
//   { "error": { "code": "ALREADY_VOTED", "message": "..." } }

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/** Bilinmeyen bir hatayı (axios ya da başka) tutarlı bir `ApiError`'a çevirir. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error) {
      return new ApiError(body.error.code, body.error.message, error.response?.status ?? 0);
    }
    if (error.code === 'ERR_NETWORK') {
      return new ApiError('NETWORK_ERROR', 'Sunucuya ulaşılamadı. Bağlantını kontrol et.', 0);
    }
    return new ApiError('UNKNOWN', error.message, error.response?.status ?? 0);
  }
  if (error instanceof Error) {
    return new ApiError('UNKNOWN', error.message, 0);
  }
  return new ApiError('UNKNOWN', 'Beklenmeyen bir hata oluştu.', 0);
}
