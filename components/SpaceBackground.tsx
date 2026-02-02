"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Space-Grade Mission Control background: mouse-reactive nebula + 3-layer parallax starfield.
 * Mounted once in layout; respects prefers-reduced-motion (static background when set).
 */
export function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    targetRef.current = { x, y };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const tick = () => {
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.05;
      const el = containerRef.current;
      if (el) {
        const { x, y } = mouseRef.current;
        el.style.setProperty("--mouse-x", `${x}`);
        el.style.setProperty("--mouse-y", `${y}`);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        // CSS vars for parallax; default center when reduced-motion or before first move
        ["--mouse-x" as string]: "0.5",
        ["--mouse-y" as string]: "0.5",
      }}
    >
      {/* Nebula: flashlight follows cursor (low-opacity teal) */}
      <div
        className="absolute inset-0 opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(
            circle  clamp(280px, 40vmax, 480px) at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%),
            rgba(34, 197, 194, 0.15) 0%,
            transparent 70%
          )`,
        }}
      />

      {/* 3 star layers: repeating dots, different densities and parallax factors */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: "radial-gradient(circle 1px, white 0%, transparent 1px)",
          backgroundSize: "48px 32px",
          transform: "translate(calc((var(--mouse-x) - 0.5) * 8px), calc((var(--mouse-y) - 0.5) * 8px))",
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle 1px, white 0%, transparent 1px)",
          backgroundSize: "80px 56px",
          transform: "translate(calc((var(--mouse-x) - 0.5) * 16px), calc((var(--mouse-y) - 0.5) * 16px))",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle 1px, rgba(255,255,255,0.9) 0%, transparent 1px)",
          backgroundSize: "128px 80px",
          transform: "translate(calc((var(--mouse-x) - 0.5) * 24px), calc((var(--mouse-y) - 0.5) * 24px))",
        }}
      />
    </div>
  );
}
