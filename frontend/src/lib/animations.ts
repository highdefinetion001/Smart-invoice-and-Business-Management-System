import { gsap } from 'gsap';

// === MASTER ANIMATION CONFIGS ===

export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  smooth: 0.7,
  slow: 1.0,
  dramatic: 1.4,
} as const;

export const STAGGER = {
  fast: 0.04,
  normal: 0.08,
  slow: 0.12,
  list: 0.06,
  grid: 0.05,
  cascade: 0.15,
} as const;

// Custom easing — GSAP built-in approximations for CustomEase
// (CustomEase requires Club GSAP, so we use power/elastic equivalents)
const EASE = {
  smoothOut: 'power2.out',
  smoothInOut: 'power2.inOut',
  bounceSoft: 'back.out(1.4)',
  elasticGentle: 'elastic.out(1, 0.5)',
  decelerate: 'power3.out',
};

// === PAGE TRANSITIONS ===

export const pageTransitions = {
  enter: (container: HTMLElement) => {
    const tl = gsap.timeline();
    tl.fromTo(
      container,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DURATION.smooth, ease: EASE.smoothOut }
    );
    return tl;
  },

  exit: (container: HTMLElement) => {
    return gsap.to(container, {
      opacity: 0,
      y: -10,
      duration: DURATION.fast,
      ease: EASE.smoothInOut,
    });
  },
};

// === STAGGER REVEAL ANIMATIONS ===

export const staggerReveal = {
  cards: (elements: HTMLElement[] | NodeListOf<Element>) => {
    return gsap.fromTo(
      elements,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DURATION.smooth,
        stagger: STAGGER.grid,
        ease: EASE.smoothOut,
      }
    );
  },

  tableRows: (rows: HTMLElement[] | NodeListOf<Element>) => {
    return gsap.fromTo(
      rows,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: DURATION.normal,
        stagger: STAGGER.list,
        ease: EASE.smoothOut,
      }
    );
  },

  listItems: (items: HTMLElement[] | NodeListOf<Element>) => {
    return gsap.fromTo(
      items,
      { opacity: 0, x: -12 },
      {
        opacity: 1,
        x: 0,
        duration: DURATION.fast,
        stagger: STAGGER.fast,
        ease: EASE.smoothOut,
      }
    );
  },

  formFields: (fields: HTMLElement[] | NodeListOf<Element>) => {
    return gsap.fromTo(
      fields,
      { opacity: 0, y: 15, x: -8 },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration: DURATION.normal,
        stagger: STAGGER.normal,
        ease: EASE.smoothOut,
      }
    );
  },
};

// === COUNTER / NUMBER ANIMATIONS ===

export const counterAnimation = {
  countUp: (
    element: HTMLElement,
    targetValue: number,
    options?: {
      prefix?: string;
      suffix?: string;
      decimals?: number;
      duration?: number;
      formatter?: (value: number) => string;
    }
  ) => {
    const {
      prefix = '',
      suffix = '',
      decimals = 0,
      duration = DURATION.dramatic,
      formatter,
    } = options || {};

    const counter = { value: 0 };

    return gsap.to(counter, {
      value: targetValue,
      duration,
      ease: EASE.smoothOut,
      onUpdate: () => {
        const formatted = formatter
          ? formatter(counter.value)
          : counter.value.toFixed(decimals);
        element.textContent = `${prefix}${formatted}${suffix}`;
      },
    });
  },

  currencyCountUp: (
    element: HTMLElement,
    targetValue: number,
    duration: number = DURATION.dramatic
  ) => {
    const counter = { value: 0 };

    return gsap.to(counter, {
      value: targetValue,
      duration,
      ease: EASE.smoothOut,
      onUpdate: () => {
        element.textContent = `₹${counter.value.toLocaleString('en-IN', {
          maximumFractionDigits: 0,
        })}`;
      },
    });
  },
};

// === MICRO-INTERACTIONS ===

export const microInteractions = {
  buttonPress: (button: HTMLElement) => {
    const tl = gsap.timeline();
    tl.to(button, {
      scale: 0.97,
      duration: DURATION.instant,
      ease: 'power2.in',
    }).to(button, {
      scale: 1,
      duration: DURATION.fast,
      ease: EASE.elasticGentle,
    });
    return tl;
  },

  cardHoverEnter: (card: HTMLElement) => {
    return gsap.to(card, {
      y: -4,
      boxShadow:
        '0 20px 25px -5px rgba(28, 25, 23, 0.08), 0 8px 10px -6px rgba(28, 25, 23, 0.06)',
      duration: DURATION.fast,
      ease: EASE.smoothOut,
    });
  },

  cardHoverLeave: (card: HTMLElement) => {
    return gsap.to(card, {
      y: 0,
      boxShadow:
        '0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.06)',
      duration: DURATION.fast,
      ease: EASE.smoothOut,
    });
  },

  removeItem: (element: HTMLElement) => {
    return gsap.to(element, {
      opacity: 0,
      height: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      x: -30,
      duration: DURATION.normal,
      ease: EASE.smoothInOut,
      onComplete: () => element.remove(),
    });
  },

  errorShake: (element: HTMLElement) => {
    return gsap.to(element, {
      x: [-8, 8, -6, 6, -3, 3, 0],
      duration: DURATION.normal,
      ease: 'power2.out',
    });
  },
};

// === INVOICE-SPECIFIC ANIMATIONS ===

export const invoiceAnimations = {
  calculationReveal: (element: HTMLElement) => {
    const tl = gsap.timeline();
    tl.fromTo(
      element,
      { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
      { opacity: 1, scaleX: 1, duration: DURATION.normal, ease: EASE.smoothOut }
    );
    tl.fromTo(
      element,
      { backgroundColor: 'rgba(212, 160, 23, 0.12)' },
      { backgroundColor: 'transparent', duration: DURATION.slow, ease: 'power2.out' },
      '-=0.2'
    );
    return tl;
  },

  priceUpdate: (element: HTMLElement) => {
    const tl = gsap.timeline();
    tl.to(element, {
      scale: 1.05,
      color: '#B8860B',
      duration: DURATION.instant,
      ease: 'power2.in',
    }).to(element, {
      scale: 1,
      color: '#1C1917',
      duration: DURATION.normal,
      ease: EASE.elasticGentle,
    });
    return tl;
  },

  totalUpdate: (element: HTMLElement) => {
    const tl = gsap.timeline();
    tl.to(element, {
      scale: 1.08,
      duration: DURATION.instant,
      ease: 'power2.in',
    })
      .to(element, {
        scale: 1,
        duration: DURATION.normal,
        ease: EASE.bounceSoft,
      })
      .fromTo(
        element,
        { textShadow: '0 0 20px rgba(212, 160, 23, 0.4)' },
        { textShadow: '0 0 0px rgba(212, 160, 23, 0)', duration: DURATION.slow },
        '-=0.4'
      );
    return tl;
  },

  lineItemAdd: (element: HTMLElement) => {
    const tl = gsap.timeline();
    tl.fromTo(
      element,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: DURATION.smooth, ease: EASE.smoothOut }
    );
    return tl;
  },
};

// === SIDEBAR ANIMATIONS ===

export const sidebarAnimations = {
  navItemHover: (item: HTMLElement) => {
    return gsap.to(item, {
      x: 4,
      duration: DURATION.fast,
      ease: EASE.smoothOut,
    });
  },

  navItemLeave: (item: HTMLElement) => {
    return gsap.to(item, {
      x: 0,
      duration: DURATION.fast,
      ease: EASE.smoothOut,
    });
  },
};

// === DIALOG ANIMATIONS ===

export const dialogAnimations = {
  overlayEnter: (overlay: HTMLElement) => {
    return gsap.fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: DURATION.fast, ease: 'power2.out' }
    );
  },

  contentEnter: (content: HTMLElement) => {
    return gsap.fromTo(
      content,
      { opacity: 0, scale: 0.95, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: DURATION.normal,
        ease: EASE.smoothOut,
      }
    );
  },
};

// === CHART ANIMATIONS ===

export const chartAnimations = {
  barGrow: (bars: HTMLElement[] | NodeListOf<Element>) => {
    return gsap.fromTo(
      bars,
      { scaleY: 0, transformOrigin: 'bottom center' },
      {
        scaleY: 1,
        duration: DURATION.smooth,
        stagger: STAGGER.grid,
        ease: EASE.smoothOut,
      }
    );
  },

  lineReveal: (path: SVGPathElement) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    return gsap.to(path, {
      strokeDashoffset: 0,
      duration: DURATION.dramatic,
      ease: EASE.smoothOut,
    });
  },
};
