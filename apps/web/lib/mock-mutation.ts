export function mockMutation<T = any>(opts: { onSuccess?: (data?: any) => void; onError?: (error?: any) => void } = {}) {
  return {
    mutateAsync: async (data?: T) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      opts.onSuccess?.({ id: "mock-id", ...(data || {}) });
    },
    isPending: false,
  };
}
