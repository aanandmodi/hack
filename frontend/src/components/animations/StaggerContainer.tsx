/**
 * StaggerContainer — wraps a list and staggers children with configurable delay.
 */

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
  delay?: number;
}

const containerVariants = (stagger: number, delay: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: delay,
      staggerChildren: stagger,
    },
  },
});

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export function StaggerContainer({
  children,
  stagger = 0.08,
  className = "",
  delay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants(stagger, delay)}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
