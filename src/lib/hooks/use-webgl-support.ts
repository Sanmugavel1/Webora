"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether WebGL is available in the current browser so 3D sections
 * can fall back to a static, fully-usable visual when it isn't.
 */
export function useWebglSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      // Starts as `null` (see useState above) and resolves after mount so
      // the first client render matches the server's, avoiding a hydration
      // mismatch — consumers treat `null` as "not yet known".
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
