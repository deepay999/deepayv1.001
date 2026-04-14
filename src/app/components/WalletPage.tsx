import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, TrendingUp, Plus } from 'lucide-react';

interface WalletCard {
  currency: string;
  symbol: string;
  flag: string;
  available: number;
  frozen: number;
  color: string;
  textColor: string;
}

const WALLETS: WalletCard[] = [
  {
    currency: 'EUR',
    symbol: '€',
    flag: '🇪🇺',
    available: 1_250.50,
    frozen: 0.00,
    color: '#0F172A',
    textColor: '#fff',
  },
  {
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    available: 320.00,
    frozen: 50.00,
    color: '#1E3A5F',
    textColor: '#fff',
  },
  {
    currency: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    available: 85.20,
    frozen: 0.00,
    color: '#1A1A2E',
    textColor: '#fff',
  },
];

function fmt(n: number, symbol: string) {
  return `${symbol}${n.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function WalletPage() {
  const [visible, setVisible] = useState(true);

  const totalEur = 1_250.50 + 320.00 * 0.92 + 85.20 * 1.17;

  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Portafoglio</h1>
        <button
          onClick={() => setVisible(v => !v)}
          className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center"
        >
          {visible
            ? <Eye className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
            : <EyeOff className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Total Balance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-4 p-5 rounded-2xl bg-neutral-900 text-white"
      >
        <p className="text-xs font-medium text-white/50 mb-1 uppercase tracking-widest">Saldo Totale</p>
        <p className="text-3xl font-bold tracking-tight">
          {visible ? `€${totalEur.toLocaleString('en-EU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '€ ••••••'}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">+€120 oggi</span>
        </div>
      </motion.div>

      {/* Currency Cards */}
      <div className="px-4 space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest px-1">I tuoi wallet</p>
        {WALLETS.map((w, i) => (
          <motion.div
            key={w.currency}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: w.color }}
          >
            <div className="p-5" style={{ color: w.textColor }}>
              {/* Card top row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{w.flag}</span>
                  <span className="text-base font-semibold opacity-90">{w.currency} Wallet</span>
                </div>
                <span className="text-xs font-medium opacity-50 bg-white/10 px-2 py-0.5 rounded-full">{w.currency}</span>
              </div>

              {/* Balance */}
              <p className="text-2xl font-bold mb-3">
                {visible ? fmt(w.available + w.frozen, w.symbol) : `${w.symbol} ••••`}
              </p>

              {/* Available / Frozen row */}
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest mb-0.5">Disponibile</p>
                  <p className="text-sm font-semibold opacity-90">
                    {visible ? fmt(w.available, w.symbol) : '••••'}
                  </p>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest mb-0.5">Bloccato</p>
                  <p className="text-sm font-semibold opacity-90">
                    {visible ? fmt(w.frozen, w.symbol) : '••••'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add currency button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-neutral-200 text-sm font-medium text-neutral-400 hover:border-neutral-300 hover:text-neutral-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Aggiungi valuta
        </motion.button>
      </div>
    </div>
  );
}
