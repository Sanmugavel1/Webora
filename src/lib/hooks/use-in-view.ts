"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Tracks whether an element is near the viewport. Used to pause expensive
 * work (like the WebGL render loop) for 3D visuals that have scrolled away.
 *
 * Uses a callback ref (backed by state) rather than a plain `useRef` — the
 * element this attaches to is often gated behind an async check (e.g. "is
 * WebGL supported?") and doesn't exist on the first render. A plain ref's
 * `.current` wouldn't be tracked as a dependency, so an effect keyed on it
 * would only ever see `null`; the callback-ref's setState re-triggers the
 * effect exactly when the real node shows up.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = "200px",
): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [node, rootMargin]);

  return [ref, inView];
}
