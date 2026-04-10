"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  className?: string;
  spread?: number;
  blur?: number;
  disabled?: boolean;
}

export function GlowingEffect({
  className,
  spread = 40,
  blur = 20,
  disabled = false
}: GlowingEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;

    let animationFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        container.style.setProperty("--glow-x", `${x}px`);
        container.style.setProperty("--glow-y", `${y}px`);
        container.style.setProperty("--glow-active", "1");
      });
    };

    const handleMouseLeave = () => {
      container.style.setProperty("--glow-active", "0");
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled]);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-auto absolute inset-0 rounded-[inherit]", className)}
      style={
        {
          "--glow-x": "0px",
          "--glow-y": "0px",
          "--glow-active": "0",
          "--glow-spread": `${spread}px`,
          "--glow-blur": `${blur}px`
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `radial-gradient(circle var(--glow-spread) at var(--glow-x) var(--glow-y), rgba(20,184,166,0.15), transparent 70%)`,
          opacity: "var(--glow-active)",
          transition: "opacity 300ms ease"
        }}
      />
      <div
        className="absolute -inset-px rounded-[inherit]"
        style={{
          background: `conic-gradient(from 0deg at var(--glow-x) var(--glow-y), rgba(20,184,166,0.25), rgba(14,165,233,0.15), transparent 40%, transparent 60%, rgba(14,165,233,0.15), rgba(20,184,166,0.25))`,
          opacity: "var(--glow-active)",
          transition: "opacity 300ms ease",
          filter: `blur(var(--glow-blur))`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px"
        }}
      />
    </div>
  );
}
