import { motion } from 'motion/react';
import { ChevronRight, Info } from 'lucide-react';

/* ── Vault data ──────────────────────────────────────────── */
const VAULTS = [
  {
    symbol: 'ETH',
    label: 'ETH',
    yield: 'up to 1.27%',
    bg: '#627EEA',
    letter: 'Ξ',
  },
  {
    symbol: 'USD',
    label: 'USD',
    yield: 'up to 3.97%',
    bg: '#22C55E',
    letter: '$',
  },
  {
    symbol: 'EURO',
    label: 'EURO',
    yield: 'up to 3.59%',
    bg: '#3B82F6',
    letter: '€',
  },
];

/* ── Pixel-art avatar SVG ────────────────────────────────── */
function PixelAvatar() {
  return (
    <div
      className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
      style={{
        background: '#6B7280',
        imageRendering: 'pixelated',
      }}
    >
      <svg viewBox="0 0 8 8" width="44" height="44" style={{ imageRendering: 'pixelated' }}>
        {/* skin */}
        <rect x="2" y="1" width="4" height="4" fill="#F5C57A" />
        {/* hat */}
        <rect x="1" y="0" width="6" height="2" fill="#2D2D2D" />
        <rect x="2" y="1" width="4" height="1" fill="#1A1A1A" />
        {/* eyes */}
        <rect x="2" y="2" width="1" height="1" fill="#1A1A1A" />
        <rect x="5" y="2" width="1" height="1" fill="#1A1A1A" />
        {/* body */}
        <rect x="1" y="5" width="6" height="3" fill="#4B5563" />
      </svg>
    </div>
  );
}

/* ── main ────────────────────────────────────────────────── */
export function VaultsPage() {
  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        background: 'linear-gradient(160deg, #E8EEF8 0%, #DDE6F5 40%, #EAF0FB 100%)',
      }}
    >
      {/* Avatar */}
      <div className="px-5 pt-5 pb-3">
        <PixelAvatar />
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-4 rounded-3xl bg-white overflow-hidden shadow-sm"
        style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
      >
        <div className="px-5 pt-5 pb-4">
          <p className="text-sm text-neutral-500 mb-2">Balance</p>
          <p
            className="font-['Outfit'] leading-none mb-0"
            style={{ fontSize: '44px', fontWeight: 800, color: '#111' }}
          >
            €<span style={{ fontSize: '56px' }}>0</span>.00
          </p>
        </div>
        <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" strokeWidth={2} />
          <span className="text-sm text-neutral-500">Projected earnings: 0.00 / year</span>
        </div>
      </motion.div>

      {/* Available Vaults */}
      <div className="px-4 mt-6 mb-2">
        <p className="text-base font-semibold text-neutral-800 mb-3">Available Vaults</p>

        <div className="space-y-3">
          {VAULTS.map((vault, i) => (
            <motion.button
              key={vault.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 shadow-sm active:bg-neutral-50 transition-colors"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
            >
              {/* Token icon */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                style={{ background: vault.bg }}
              >
                {vault.letter}
              </div>

              {/* Name */}
              <span className="flex-1 text-left text-base font-semibold text-neutral-900">
                {vault.label}
              </span>

              {/* Yield + chevron */}
              <span className="text-sm text-neutral-500 font-medium mr-1">{vault.yield}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" strokeWidth={2} />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
