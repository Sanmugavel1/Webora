"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks whether an element is near the viewport. Used to pause expensive
 * work (like the WebGL render loop) for 3D visuals that have scrolled away.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = "200px",
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, inView];
}
