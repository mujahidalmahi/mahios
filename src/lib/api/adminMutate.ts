export interface AdminMutateOptions {
  table: string;
  action?: 'upsert' | 'insert' | 'update' | 'delete' | 'select' | 'batch_order';
  data?: any;
  match?: Record<string, any>;
  select?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  items?: any[];
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
    if (!res.ok || !result.success) {
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

/**
 * Fetch rows securely as an authenticated administrator,
 * bypassing client-side anonymous RLS restrictions.
 */
export async function adminFetch<T = any>(
  table: string,
  options?: {
    select?: string;
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
): Promise<{ success: boolean; data: T[]; error?: string }> {
  const res = await adminMutate<T[]>({
    table,
    action: 'select',
    ...options,
  });

  return {
    success: res.success,
    data: (res.data || []) as T[],
    error: res.error,
  };
}

/**
 * Atomic batch reordering for list items in a single HTTP request
 */
export async function adminBatchOrder(
  table: string,
  items: Array<{ id: string; sort_order?: number; sort_index?: number }>
): Promise<AdminMutateResult> {
  return adminMutate({
    table,
    action: 'batch_order',
    items,
  });
}
