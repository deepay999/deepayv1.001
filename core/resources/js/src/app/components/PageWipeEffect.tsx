import { motion, AnimatePresence } from 'framer-motion';

interface PageWipeEffectProps {
  isActive: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  color?: string;
}

export function PageWipeEffect({ isActive, direction = 'horizontal', color = 'black' }: PageWipeEffectProps) {
  const variants = {
    horizontal: {
      initial: { x: '-100%' },
      animate: { x: '100%' },
      exit: { x: '100%' }
    },
    vertical: {
      initial: { y: '-100%' },
      animate: { y: '100%' },
      exit: { y: '100%' }
    },
    diagonal: {
      initial: { x: '-100%', y: '-100%' },
      animate: { x: '100%', y: '100%' },
      exit: { x: '100%', y: '100%' }
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          variants={variants[direction]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.6, 0.05, 0.01, 0.9] }}
          className={`fixed inset-0 bg-${color} z-50 pointer-events-none`}
        />
      )}
    </AnimatePresence>
  );
}

// Circular wipe effect
export function CircularWipeEffect({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ scale: 0, borderRadius: '50%' }}
          animate={{ scale: 3, borderRadius: '0%' }}
          exit={{ scale: 0, borderRadius: '50%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 bg-black z-50 pointer-events-none origin-center"
        />
      )}
    </AnimatePresence>
  );
}

// Shutter effect
export function ShutterEffect({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.6, 0.05, 0.01, 0.9]
              }}
              className="fixed top-0 bottom-0 bg-black z-50 pointer-events-none"
              style={{
                left: `${i * 20}%`,
                width: '20%',
                transformOrigin: 'top'
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
}

// Glitch effect
export function GlitchEffect({ isActive }: { isActive: boolean }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0, 1, 0],
            x: [0, -5, 5, -5, 0],
            filter: [
              'hue-rotate(0deg)',
              'hue-rotate(90deg)',
              'hue-rotate(180deg)',
              'hue-rotate(270deg)',
              'hue-rotate(360deg)'
            ]
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] }}
          className="fixed inset-0 bg-white/10 backdrop-blur-sm z-50 pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
