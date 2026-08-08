"use client";

import { useEffect, useState } from "react";

/** Subscribes to a CSS media query and returns whether it currently matches. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    // Set after mount (not via a lazy useState initializer) so the first
    // client render matches the server's, avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mql.matches);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
