import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One toast at a time, with the dismiss timer owned by the hook so unmounting
 * a screen (or showing a second toast) cannot leave a stray timeout behind.
 */
export default function useToast(duration = 4000) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const clearToast = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, tone = 'success') => {
      if (timer.current) clearTimeout(timer.current);

      setToast({ message, tone });
      timer.current = setTimeout(() => {
        timer.current = null;
        setToast(null);
      }, duration);
    },
    [duration],
  );

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, showToast, clearToast };
}
