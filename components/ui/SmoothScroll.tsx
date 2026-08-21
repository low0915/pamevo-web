"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling, driven off the GSAP ticker.
 *
 * Lenis interpolates toward the scroll target with a lerp, so it eases to a
 * stop without ever passing the target: smooth, no bounce.
 *
 * Running Lenis on `gsap.ticker` rather than its own rAF loop keeps it on the
 * same clock as every ScrollTrigger on the page. Two independent loops would
 * read and write scroll position in an undefined order and the pinned hero
 * would judder. `lagSmoothing(0)` stops GSAP from silently skipping time after
 * a slow frame, which would desync the scrubbed video from the scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Touch platforms have their own momentum; ours would only fight it.
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}
