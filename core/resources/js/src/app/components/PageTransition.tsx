import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export function PageTransition({ children, direction = 'right' }: PageTransitionProps) {
  const variants = {
    left: {
      initial: { x: -50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 50, opacity: 0 }
    },
    right: {
      initial: { x: 50, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -50, opacity: 0 }
    },
    up: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 }
    },
    down: {
      initial: { y: -50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 }
    }
  };

  return (
    <motion.div
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// Page swipe transition wrapper
export function PageSwipeTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, rotateY: -10 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      exit={{ scale: 0.95, opacity: 0, rotateY: 10 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="h-full"
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

// Slide and fade transition
export function SlideUpTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// Fade with blur
export function FadeBlurTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

// Zoom transition
export function ZoomTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 1.2, opacity: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
