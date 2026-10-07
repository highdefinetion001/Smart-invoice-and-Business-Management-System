'use client';

import { useEffect, useRef } from 'react';
import { counterAnimation } from '@/lib/animations';

export function useCountUp(
  value: number,
  options?: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    duration?: number;
    formatter?: (value: number) => string;
  }
) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current || value === prevValue.current) return;

    counterAnimation.countUp(ref.current, value, {
      ...options,
    });

    prevValue.current = value;
  }, [value, options]);

  return ref;
}

export function useCurrencyCountUp(value: number, duration?: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current || value === prevValue.current) return;

    counterAnimation.currencyCountUp(ref.current, value, duration);
    prevValue.current = value;
  }, [value, duration]);

  return ref;
}
