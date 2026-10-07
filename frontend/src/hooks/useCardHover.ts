'use client';

import { useRef, useCallback } from 'react';
import { microInteractions } from '@/lib/animations';

export function useCardHover() {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseEnter = useCallback(() => {
    if (ref.current) microInteractions.cardHoverEnter(ref.current);
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) microInteractions.cardHoverLeave(ref.current);
  }, []);

  return { ref, onMouseEnter, onMouseLeave };
}
