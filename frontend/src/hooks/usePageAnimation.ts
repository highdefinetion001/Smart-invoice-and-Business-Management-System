'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { STAGGER } from '@/lib/animations';

export function usePageAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cards = container.querySelectorAll('[data-animate="card"]');
    const statCards = container.querySelectorAll('[data-animate="stat-card"]');
    const rows = container.querySelectorAll('[data-animate="row"]');
    const fields = container.querySelectorAll('[data-animate="field"]');
    const pageTitle = container.querySelectorAll('[data-animate="page-title"]');
    const pageSubtitle = container.querySelectorAll('[data-animate="page-subtitle"]');
    const toolbar = container.querySelectorAll('[data-animate="toolbar"]');
    const tableContainer = container.querySelectorAll('[data-animate="table-container"]');
    const tableRows = container.querySelectorAll('[data-animate="table-row"]');
    const chartPanels = container.querySelectorAll('[data-animate="chart-panel"]');
    const customerCards = container.querySelectorAll('[data-animate="customer-card"]');

    const ctx = gsap.context(() => {
      // Page entry
      gsap.fromTo(
        container,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );

      if (pageTitle.length) {
        gsap.fromTo(
          pageTitle,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        );
      }

      if (pageSubtitle.length) {
        gsap.fromTo(
          pageSubtitle,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.2 }
        );
      }

      if (toolbar.length) {
        gsap.fromTo(
          toolbar,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.25 }
        );
      }

      if (statCards.length) {
        gsap.fromTo(
          statCards,
          { opacity: 0, y: 40, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: STAGGER.grid,
            ease: 'power2.out',
            delay: 0.2,
          }
        );
      }

      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: STAGGER.grid,
            ease: 'power2.out',
            delay: 0.2,
          }
        );
      }

      if (tableContainer.length) {
        gsap.fromTo(
          tableContainer,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.3 }
        );
      }

      if (rows.length) {
        gsap.fromTo(
          rows,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: STAGGER.list,
            ease: 'power2.out',
            delay: 0.15,
          }
        );
      }

      if (tableRows.length) {
        gsap.fromTo(
          tableRows,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: STAGGER.list,
            ease: 'power2.out',
            delay: 0.35,
          }
        );
      }

      if (fields.length) {
        gsap.fromTo(
          fields,
          { opacity: 0, y: 15, x: -8 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.5,
            stagger: STAGGER.normal,
            ease: 'power2.out',
            delay: 0.1,
          }
        );
      }

      if (chartPanels.length) {
        gsap.fromTo(
          chartPanels,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.4,
          }
        );
      }

      if (customerCards.length) {
        gsap.fromTo(
          customerCards,
          { opacity: 0, y: 30, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: STAGGER.normal,
            ease: 'power2.out',
            delay: 0.3,
          }
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
