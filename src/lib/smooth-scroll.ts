import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

/**
 * Called by <SmoothScroll> whenever it creates/destroys its Lenis instance,
 * so other components (nav links, hero CTAs) can request an in-page smooth
 * scroll without holding a reference to Lenis themselves.
 */
export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

/**
 * Smoothly scrolls to an in-page element. Routed through the live Lenis
 * instance so it matches the site's inertia scrolling — plain hash-anchor
 * jumps would otherwise be instant, since `html { scroll-behavior: auto }`
 * hands scroll control to Lenis. Falls back to the browser's native smooth
 * scroll when Lenis isn't running (e.g. prefers-reduced-motion, where
 * <SmoothScroll> never instantiates it).
 */
export function scrollToSelector(selector: string, offset = -84) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset, duration: 1.3 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
