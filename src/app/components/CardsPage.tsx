import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlignJustify, Snowflake, Settings2, Plus,
} from 'lucide-react';

/* ── Card data ──────────────────────────────────────────── */
const CARDS = [
  { id: 1, last4: 'bb3b', network: 'VISA', color: '#F0C27F', textColor: '#fff' },
  { id: 2, last4: '7709', network: 'VISA', color: 'linear-gradient(135deg,#9CA3AF,#D1D5DB)', textColor: '#fff' },
];

/* ── BankCard ────────────────────────────────────────────── */
function BankCard({
  last4,
  network,
  color,
  textColor,
  frozen,
}: {
  last4: string;
  network: string;
  color: string;
  textColor: string;
  frozen: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      className="rounded-3xl relative overflow-hidden flex-shrink-0"
      style={{
        background: color,
        aspectRatio: '1.586 / 1',
        width: '80vw',
        maxWidth: '320px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
      }}
    >
      {/* Frozen overlay */}
      <AnimatePresence>
        {frozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl"
          >
            <div className="text-center text-white">
              <Snowflake className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <p className="text-sm font-semibold opacity-80">Card frozen</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom row */}
      <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between z-20">
        <div style={{ color: textColor }} className="text-base font-mono tracking-widest opacity-90">
          ·· {last4}
        </div>
        <div style={{ color: textColor }} className="font-bold text-2xl tracking-wider italic">
          {network}
        </div>
      </div>
    </motion.div>
  );
}

/* ── main ────────────────────────────────────────────────── */
export function CardsPage() {
  const [frozen, setFrozen] = useState(false);
  const [activeCard] = useState(0);

  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7]">
      {/* Header — only + button */}
      <div className="flex justify-end px-5 pt-5 pb-2">
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
          <Plus className="w-5 h-5 text-neutral-800" strokeWidth={2} />
        </button>
      </div>

      {/* Card carousel */}
      <div className="mt-4 mb-8 pl-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            className="snap-start flex-shrink-0"
            style={{ opacity: i === activeCard ? 1 : 0.55, transform: i === activeCard ? 'scale(1)' : 'scale(0.95)' }}
          >
            <BankCard
              last4={card.last4}
              network={card.network}
              color={card.color}
              textColor={card.textColor}
              frozen={frozen && i === activeCard}
            />
          </div>
        ))}
        {/* spacer */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* 3 action buttons */}
      <div className="flex justify-center gap-10 mb-8">
        {[
          { icon: AlignJustify, label: 'Details', active: false },
          { icon: Snowflake,    label: 'Freeze',  active: frozen,  onPress: () => setFrozen(v => !v) },
          { icon: Settings2,   label: 'Settings', active: false },
        ].map(({ icon: Icon, label, active, onPress }) => (
          <button
            key={label}
            onClick={onPress}
            className="flex flex-col items-center gap-2"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={
                active
                  ? {
                      background: '#fff',
                      border: '2.5px solid #38BDF8',
                      boxShadow: '0 0 0 4px rgba(56,189,248,0.15)',
                    }
                  : { background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }
              }
            >
              <Icon
                className="w-5 h-5"
                style={{ color: active ? '#0EA5E9' : '#1C1C1E' }}
                strokeWidth={active ? 2.2 : 1.8}
              />
            </div>
            <span className="text-xs font-medium text-neutral-700">{label}</span>
          </button>
        ))}
      </div>

      {/* Add to G Pay */}
      <div className="mx-5">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-black text-white text-base font-semibold shadow-md"
        >
          <span>Add to</span>
          {/* Google G */}
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" fill="#FFC107"/>
            <path d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" fill="#FF3D00"/>
            <path d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" fill="#4CAF50"/>
            <path d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" fill="#1976D2"/>
          </svg>
          <span>Pay</span>
        </motion.button>
      </div>
    </div>
  );
}


