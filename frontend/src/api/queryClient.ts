import { QueryClient } from '@tanstack/react-query';

import { ApiError, toApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: (failureCount, error) => {
        const apiError = error instanceof ApiError ? error : toApiError(error);
        // Kimlik/yetki/doğrulama hatalarında yeniden denemek anlamsız.
        if ([400, 401, 403, 404, 409].includes(apiError.status)) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/** Query key'lerin tek yerden yönetimi; yazım hatalarını önler. */
export const queryKeys = {
  me: ['me'] as const,
  polls: {
    list: (params: Record<string, unknown>) => ['polls', 'list', params] as const,
    detail: (id: string) => ['polls', 'detail', id] as const,
    mine: (params: Record<string, unknown>) => ['polls', 'mine', params] as const,
  },
};
