"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Space-Grade Mission Control background: mouse-reactive nebula + starfield.
 * Respects prefers-reduced-motion: static background and single star layer when set.
 */
export function SpaceBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const nebulaRef = useRef({ x: 0.5, y: 0.5 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    targetRef.current = { x, y };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const tick = () => {
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.05;
      nebulaRef.current.x += (targetRef.current.x - nebulaRef.current.x) * 0.02;
      nebulaRef.current.y += (targetRef.current.y - nebulaRef.current.y) * 0.02;
      const el = containerRef.current;
      if (el) {
        const { x, y } = mouseRef.current;
        const { x: nx, y: ny } = nebulaRef.current;
        el.style.setProperty("--mouse-x", `${x}`);
        el.style.setProperty("--mouse-y", `${y}`);
        el.style.setProperty("--nebula-x", `${nx}`);
        el.style.setProperty("--nebula-y", `${ny}`);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        ["--mouse-x" as string]: "0.5",
        ["--mouse-y" as string]: "0.5",
        ["--nebula-x" as string]: "0.5",
        ["--nebula-y" as string]: "0.5",
      }}
    >
      {/* Nebula: large blurred blob (cyan/5), high-delay follow = fluid swimming */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle clamp(320px, 50vmax, 560px) at calc(var(--nebula-x) * 100%) calc(var(--nebula-y) * 100%),
              rgba(6, 182, 212, 0.05) 0%,
              transparent 65%
            )`,
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Parallax starfield: 3 layers at ratios 0.2, 0.5, 0.8 (max offset 40px) */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: "radial-gradient(circle 1px, white 0%, transparent 1px)",
          backgroundSize: "48px 32px",
          transform: reducedMotion ? "none" : "translate(calc((var(--mouse-x) - 0.5) * 8px), calc((var(--mouse-y) - 0.5) * 8px))",
        }}
      />
      {!reducedMotion && (
        <>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "radial-gradient(circle 1px, white 0%, transparent 1px)",
              backgroundSize: "80px 56px",
              transform: "translate(calc((var(--mouse-x) - 0.5) * 20px), calc((var(--mouse-y) - 0.5) * 20px))",
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle 1px, rgba(255,255,255,0.9) 0%, transparent 1px)",
              backgroundSize: "128px 80px",
              transform: "translate(calc((var(--mouse-x) - 0.5) * 32px), calc((var(--mouse-y) - 0.5) * 32px))",
            }}
          />
        </>
      )}
    </div>
  );
}
