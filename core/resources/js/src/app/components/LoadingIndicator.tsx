import { motion } from 'framer-motion';

export function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-16 h-16 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-primary/50 border-b-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Pulse loader
export function PulseLoader() {
  return (
    <div className="flex gap-2">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

// Spinner with trail
export function SpinnerWithTrail() {
  return (
    <div className="relative w-16 h-16">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{ rotate: `${i * 45}deg` }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        >
          <div className="w-2 h-2 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
        </motion.div>
      ))}
    </div>
  );
}

// Bars loader
export function BarsLoader() {
  return (
    <div className="flex gap-1 items-end h-12">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-primary rounded-full"
          animate={{
            height: ['20%', '100%', '20%']
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Orbital loader
export function OrbitalLoader() {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
      />
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2 - i * 0.3,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <div
            className="w-3 h-3 bg-primary rounded-full absolute top-0 left-1/2 -translate-x-1/2"
            style={{ opacity: 1 - i * 0.3 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
