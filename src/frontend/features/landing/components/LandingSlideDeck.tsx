"use client";

import type { CSSProperties, ReactNode, TransitionEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDE_COUNT = 5;
const TRANSITION_MS = 560;
const WHEEL_IDLE_MS = 180;
const WHEEL_THRESHOLD = 28;
const SLIDE_HASHES = ["", "how", "clear", "ai", "start"] as const;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

function slideIndexFromHash(hash: string) {
  const normalized = hash.replace(/^#/, "");
  return SLIDE_HASHES.indexOf(normalized as (typeof SLIDE_HASHES)[number]);
}

export function LandingSlideDeck({ children }: { children: ReactNode }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("down");
  const deckRef = useRef<HTMLElement>(null);
  const activeSlideRef = useRef(0);
  const transitionLockedRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelGestureTriggeredRef = useRef(false);

  const unlockTransition = useCallback(() => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
    transitionLockedRef.current = false;
    setIsTransitioning(false);
  }, []);

  const moveToSlide = useCallback((requestedSlide: number) => {
    const nextSlide = Math.max(0, Math.min(SLIDE_COUNT - 1, requestedSlide));
    const previousSlide = activeSlideRef.current;
    if (transitionLockedRef.current || nextSlide === previousSlide) return false;

    transitionLockedRef.current = true;
    activeSlideRef.current = nextSlide;
    setDirection(nextSlide > previousSlide ? "down" : "up");
    setIsTransitioning(true);
    setActiveSlide(nextSlide);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    transitionTimerRef.current = window.setTimeout(unlockTransition, reduceMotion ? 20 : TRANSITION_MS + 80);
    return true;
  }, [unlockTransition]);

  useEffect(() => {
    const initialSlide = slideIndexFromHash(window.location.hash);
    const initialNavigationFrame = initialSlide > 0
      ? window.requestAnimationFrame(() => moveToSlide(initialSlide))
      : null;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || event.deltaY === 0) return;
      event.preventDefault();

      if (wheelIdleTimerRef.current !== null) window.clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
        wheelGestureTriggeredRef.current = false;
        wheelIdleTimerRef.current = null;
      }, WHEEL_IDLE_MS);

      if (wheelGestureTriggeredRef.current || transitionLockedRef.current) return;

      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? window.innerHeight
        : event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
      wheelAccumulatorRef.current += event.deltaY * multiplier;
      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) return;

      wheelGestureTriggeredRef.current = true;
      moveToSlide(activeSlideRef.current + Math.sign(wheelAccumulatorRef.current));
      wheelAccumulatorRef.current = 0;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isEditableTarget(event.target)) return;
      const directionByKey: Partial<Record<string, number>> = {
        ArrowDown: 1,
        PageDown: 1,
        ArrowUp: -1,
        PageUp: -1,
      };
      const keyDirection = directionByKey[event.key];
      if (!keyDirection) return;
      event.preventDefault();
      moveToSlide(activeSlideRef.current + keyDirection);
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const targetSlide = slideIndexFromHash(anchor.hash);
      if (targetSlide < 0) return;
      event.preventDefault();
      if (moveToSlide(targetSlide)) window.history.pushState(null, "", anchor.hash || window.location.pathname);
    };

    const handleHistoryNavigation = () => {
      const targetSlide = slideIndexFromHash(window.location.hash);
      if (targetSlide >= 0) moveToSlide(targetSlide);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handleHistoryNavigation);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      if (initialNavigationFrame !== null) window.cancelAnimationFrame(initialNavigationFrame);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handleHistoryNavigation);
      document.removeEventListener("click", handleAnchorClick);
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
      if (wheelIdleTimerRef.current !== null) window.clearTimeout(wheelIdleTimerRef.current);
    };
  }, [moveToSlide]);

  useEffect(() => {
    const slides = deckRef.current?.querySelectorAll<HTMLElement>("[data-landing-slide]");
    slides?.forEach((slide, index) => {
      slide.inert = index !== activeSlide;
      slide.setAttribute("aria-hidden", String(index !== activeSlide));
    });
  }, [activeSlide]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName === "transform") unlockTransition();
  };

  return (
    <main
      ref={deckRef}
      id="main-content"
      className={`landing-content landing-slide-deck landing-slide-deck--${direction}${isTransitioning ? " is-transitioning" : ""}`}
      data-testid="landing-content"
      data-active-slide={activeSlide}
      data-transitioning={isTransitioning}
      tabIndex={-1}
    >
      <div
        className="landing-slide-track"
        style={{ "--landing-slide-index": activeSlide } as CSSProperties}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
      <span className="landing-slide-deck__pixels" aria-hidden="true" />
    </main>
  );
}
