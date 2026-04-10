"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ContainerScrollProps {
  header: ReactNode;
  children: ReactNode;
}

export function ContainerScroll({ header, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 0.4], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1.05, 0.95]);
  const translateY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start"
      style={{ perspective: "1000px" }}
    >
      <motion.div style={{ translateY }} className="w-full max-w-4xl">
        {header}
      </motion.div>
      <motion.div
        style={{ rotateX: rotate, scale }}
        className="mx-auto w-full max-w-5xl"
      >
        {children}
      </motion.div>
    </div>
  );
}
