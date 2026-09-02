'use client';

import { useEffect, useCallback } from 'react';

/**
 * Warns the user before they navigate away with unsaved changes.
 * Pass `isDirty = true` when the form has unsaved changes.
 */
export function useUnsavedChanges(isDirty: boolean) {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    },
    [isDirty]
  );

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [handleBeforeUnload]);
}
