import { useRef, useEffect } from 'react';

export function useAutoScroll(shouldScroll) {
  const endRef = useRef(null);

  useEffect(() => {
    if (shouldScroll) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return endRef;
}
