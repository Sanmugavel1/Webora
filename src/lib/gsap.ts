"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registers GSAP plugins exactly once on the client. */
export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export { gsap, ScrollTrigger };
