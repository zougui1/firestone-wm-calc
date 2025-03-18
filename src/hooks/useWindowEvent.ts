import { useEffect, useRef } from 'react';

export const useWindowEvent = <K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, event: WindowEventMap[K]) => void
) => {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    const callback = listenerRef.current;
    window.addEventListener(type, callback);

    return () => {
      window.removeEventListener(type, callback);
    }
  }, []);
}
