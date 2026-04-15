import { motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 bg-gradient-to-br from-black via-neutral-950 to-black z-50 flex items-center justify-center overflow-hidden"
    >
      {/* Animated sophisticated grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 0.5px, transparent 0.5px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '30px 30px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '30px 30px']
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Subtle green gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* DeePay Logo - Clean Design */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10"
      >
        {/* Subtle green glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Logo container with subtle accent */}
        <div
          className="relative w-28 h-28 rounded-[2rem] flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          }}
        >
          {/* D letter - green design */}
          <svg width="60" height="60" viewBox="0 0 60 60" className="relative z-10">
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <motion.path
              d="M15 10 L15 50 L32 50 C 42 50 48 42 48 30 C 48 18 42 10 32 10 Z M20 15 L32 15 C 38 15 43 21 43 30 C 43 39 38 45 32 45 L20 45 Z"
              fill="url(#greenGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Brand name with premium typography */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="absolute bottom-40 text-center"
      >
        <h1 className="text-5xl font-bold text-white font-['Outfit'] mb-3 tracking-tight">
          DeePay
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/60 text-sm tracking-[0.2em] uppercase"
        >
          Wallets Cards Payouts
        </motion.p>

        {/* Animated green underline */}
        <motion.div
          className="mt-4 h-[2px] mx-auto rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.6), transparent)'
          }}
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ delay: 1.5, duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>

      {/* Clean loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-20 flex items-center gap-3"
      >
        {/* Animated dots */}
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
