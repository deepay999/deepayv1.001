import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, Snowflake, SlidersHorizontal, Settings2,
  Plus, Mail, BarChart2, MoreHorizontal, ShieldCheck,
  CreditCard,
} from 'lucide-react';

/* ── Card Component ─────────────────────────────────────── */
function BankCard({
  last4 = '7709',
  network = 'VISA',
  frozen = false,
}: {
  last4?: string;
  network?: string;
  frozen?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      className="mx-4 rounded-3xl overflow-hidden relative"
      style={{
        background: 'linear-gradient(145deg, #1A1A1A 0%, #0A0A0A 100%)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
        aspectRatio: '1.586 / 1',
      }}
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)',
        }}
      />

      {/* Frozen overlay */}
      <AnimatePresence>
        {frozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"
          >
            <div className="text-center text-white">
              <Snowflake className="w-10 h-10 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold opacity-80">Carta congelata</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top row */}
      <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-20">
        {/* DeePay logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 60 60" fill="none">
              <path d="M15 10L15 50L32 50C42 50 48 42 48 30C48 18 42 10 32 10Z M20 15L32 15C38 15 43 21 43 30C43 39 38 45 32 45L20 45Z" fill="white" />
            </svg>
          </div>
          <span className="text-white font-bold text-sm tracking-tight">DeePay</span>
        </div>
        {/* Colour circle (like Deblock reference) */}
        <div
          className="w-7 h-7 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
          }}
        />
      </div>

      {/* Bottom row */}
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-20">
        <div className="text-white/70 text-sm font-mono tracking-widest">
          •• •• {last4}
        </div>
        <div className="text-white font-bold text-2xl tracking-wider italic">{network}</div>
      </div>
    </motion.div>
  );
}

/* ── main ────────────────────────────────────────────────── */
export function CardsPage() {
  const [frozen, setFrozen] = useState(false);

  const actions = [
    { icon: Eye,              label: 'Dettagli',  action: () => {} },
    { icon: Snowflake,        label: frozen ? 'Sblocca' : 'Congela', action: () => setFrozen(v => !v), active: frozen },
    { icon: SlidersHorizontal,label: 'Limiti',    action: () => {} },
    { icon: Settings2,        label: 'Imposta',   action: () => {} },
  ];

  const txEmpty = true; // demo: no transactions yet

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 font-['Outfit']">Carte</h1>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full hover:bg-neutral-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-neutral-50 flex items-center justify-center">
            <Plus className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Card */}
      <BankCard frozen={frozen} />

      {/* 4 action buttons */}
      <div className="grid grid-cols-4 gap-2 mx-4 mt-5">
        {actions.map(({ icon: Icon, label, action, active }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.92 }}
            onClick={action}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              active ? 'bg-blue-100' : 'bg-neutral-100 hover:bg-neutral-200'
            }`}>
              <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-neutral-700'}`} strokeWidth={1.5} />
            </div>
            <span className="text-xs text-neutral-500 font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Add to Google Wallet */}
      <div className="mx-4 mt-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-black text-white text-sm font-semibold"
        >
          {/* Google Wallet colour icon */}
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <svg width="20" height="16" viewBox="0 0 48 38" fill="none">
              <rect x="0" y="0" width="12" height="38" rx="3" fill="#4285F4" />
              <rect x="12" y="0" width="12" height="38" rx="3" fill="#EA4335" />
              <rect x="24" y="0" width="12" height="38" rx="3" fill="#FBBC05" />
              <rect x="36" y="0" width="12" height="38" rx="3" fill="#34A853" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-[10px] text-white/60 font-normal leading-none mb-0.5">Aggiungi a</div>
            <div className="text-sm font-bold">Google Wallet</div>
          </div>
        </motion.button>
      </div>

      {/* Transactions section */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-neutral-900">Transazioni</h2>
          <div className="flex gap-2">
            <button className="p-1.5 rounded-lg hover:bg-neutral-50">
              <BarChart2 className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-neutral-50">
              <MoreHorizontal className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {txEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <CreditCard className="w-7 h-7 text-neutral-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Nessuna transazione</p>
            <p className="text-xs text-neutral-400 max-w-[200px]">
              Le transazioni con questa carta appariranno qui.
            </p>
          </motion.div>
        ) : null}
      </div>

      {/* Security badge */}
      <div className="mx-4 mb-4 mt-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-700">Protezione antifrode attiva · 3D Secure abilitato</p>
      </div>
    </div>
  );
}
