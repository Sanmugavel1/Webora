"use client";

import { useEffect, useState } from "react";

/** Tracks the user's `prefers-reduced-motion` preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Deliberately set after mount, not via a lazy useState initializer: the
    // server always renders `false`, so this keeps the first client render
    // identical to the server's and avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(query.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}
