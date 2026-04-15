import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, Lock, TrendingUp, RefreshCw } from 'lucide-react';
import { api, Wallet as WalletData } from '../services/api';

/* ── static fallback data ───────────────────────────────────── */
const FALLBACK: WalletData[] = [
  { currency: 'EUR', available: 1000.0, frozen: 100.0 },
  { currency: 'USD', available: 500.0, frozen: 0.0 },
  { currency: 'GBP', available: 320.5, frozen: 0.0 },
];

const CURRENCY_FLAGS: Record<string, string> = {
  EUR: '🇪🇺',
  USD: '🇺🇸',
  GBP: '🇬🇧',
};

const CURRENCY_COLORS: Record<string, string> = {
  EUR: 'from-blue-500 to-indigo-600',
  USD: 'from-emerald-500 to-teal-600',
  GBP: 'from-violet-500 to-purple-600',
};

function WalletCard({ wallet, index }: { wallet: WalletData; index: number }) {
  const gradient = CURRENCY_COLORS[wallet.currency] ?? 'from-neutral-700 to-neutral-900';
  const flag = CURRENCY_FLAGS[wallet.currency] ?? '💰';
  const total = wallet.available + wallet.frozen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`mx-4 mb-3 rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <span className="text-base font-semibold tracking-wide">{wallet.currency} Wallet</span>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
      </div>

      {/* Total */}
      <p className="text-3xl font-bold tracking-tight mb-1">
        {wallet.currency === 'EUR' ? '€' : wallet.currency === 'USD' ? '$' : '£'}
        {total.toFixed(2)}
      </p>
      <p className="text-xs text-white/60 mb-4">Total balance</p>

      {/* Available / Frozen */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/70">Available</span>
          </div>
          <p className="text-sm font-semibold">{wallet.available.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/70">Frozen</span>
          </div>
          <p className="text-sm font-semibold">{wallet.frozen.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function WalletPage() {
  const [wallets, setWallets] = useState<WalletData[]>(FALLBACK);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getWallets();
      if (Array.isArray(data) && data.length > 0) setWallets(data);
    } catch {
      /* keep fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Wallets</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Your multi-currency balances</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={load}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Wallet cards */}
      <div className="pb-6">
        {wallets.map((w, i) => (
          <WalletCard key={w.currency} wallet={w} index={i} />
        ))}
      </div>
    </div>
  );
}
