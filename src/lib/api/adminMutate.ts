export interface AdminMutateOptions {
  table: string;
  action?: 'upsert' | 'insert' | 'update' | 'delete';
  data?: any;
  match?: Record<string, any>;
}

export interface AdminMutateResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function adminMutate<T = any>(
  options: AdminMutateOptions
): Promise<AdminMutateResult<T>> {
  try {
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: result.error || `Server responded with status ${res.status}`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error during mutation',
    };
  }
}
