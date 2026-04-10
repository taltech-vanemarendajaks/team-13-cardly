"use client";

import React, { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface ContainerScrollProps {
  titleComponent: ReactNode;
  children: ReactNode;
}

export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    setReady(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isMobile ? ["start start", "end start"] : ["start end", "end start"]
  });

  const end = isMobile ? 0.2 : 0.6;
  const rotate = useTransform(scrollYProgress, [0, end], [ready && isMobile ? 18 : 30, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, end],
    ready && isMobile ? [0.95, 1] : [1.05, 1]
  );
  const translate = useTransform(
    scrollYProgress,
    [0, end],
    [0, ready && isMobile ? -50 : -100]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative flex min-h-[40rem] items-start justify-center px-2 pt-0 md:h-[80rem] md:items-center md:p-20"
      ref={containerRef}
    >
      <div
        className="relative w-full py-6 md:py-40"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </motion.div>
  );
}

function Header({
  translate,
  titleComponent
}: {
  translate: MotionValue<number>;
  titleComponent: ReactNode;
}) {
  return (
    <motion.div style={{ translateY: translate }} className="mx-auto max-w-5xl text-center">
      {titleComponent}
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={{ rotateX: rotate, scale }}
      className="mx-auto mt-6 h-auto w-full max-w-7xl md:mt-10 md:h-[40rem]"
    >
      {children}
    </motion.div>
  );
}
