'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function useGsapRegistered() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }
  }, []);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface RevealProps {
  children: ReactNode;
  /** Vertical travel in px. */
  y?: number;
  delay?: number;
  className?: string;
  /** Render as this element. */
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

/** Scroll-triggered reveal: fades + rises into view once, batched per element. */
export function Reveal({ children, y = 28, delay = 0, className, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGsapRegistered();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [y, delay]);

  const Tag = as as 'div';
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

interface CounterProps {
  to: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/** Animated number counter that runs when scrolled into view. */
export function Counter({ to, suffix = '', prefix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useGsapRegistered();

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${to}${suffix}`;
      return;
    }
    const obj = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        v: to,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
        },
      });
    }, el);
    return () => ctx.revert();
  }, [to, suffix, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
