import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, Globe, Users, ChevronDown, ArrowUpDown,
  Search, ChevronRight,
} from 'lucide-react';

/* ── Recent recipients ──────────────────────────────────── */
const RECENT = [
  { name: 'Marco R.',   initials: 'MR', color: '#6366F1' },
  { name: 'Sarah C.',   initials: 'SC', color: '#EC4899' },
  { name: 'Li Wei',     initials: 'LW', color: '#14B8A6' },
  { name: 'Anna B.',    initials: 'AB', color: '#F59E0B' },
];

/* ── Currency pair ──────────────────────────────────────── */
const CURRENCIES = ['USD', 'EUR', 'CNY', 'GBP', 'JPY', 'HKD', 'AUD'];

export function RemittancePage() {
  const [fromCurrency, setFromCurrency]   = useState('USD');
  const [toCurrency, setToCurrency]       = useState('CNY');
  const [amount, setAmount]               = useState('1000');
  const [mode, setMode]                   = useState<'global' | 'internal'>('global');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker]   = useState(false);

  const RATES: Record<string, number> = {
    'USD-CNY': 7.24, 'USD-EUR': 0.92, 'USD-GBP': 0.79,
    'EUR-CNY': 7.87, 'EUR-USD': 1.09, 'CNY-USD': 0.138,
  };
  const rate = RATES[`${fromCurrency}-${toCurrency}`] ?? 1;
  const received = (parseFloat(amount.replace(/,/g, '') || '0') * rate).toFixed(2);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7] pb-6">
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold text-neutral-900 mb-4">汇款</h1>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {([['global', '全球汇款', Globe], ['internal', '内部转账', Users]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                mode === id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent recipients */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">最近收款人</p>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {RECENT.map(r => (
            <button key={r.name} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: r.color }}
              >
                {r.initials}
              </div>
              <span className="text-xs text-neutral-600 font-medium">{r.name}</span>
            </button>
          ))}
          <button className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
              <Search className="w-5 h-5 text-neutral-400" strokeWidth={1.8} />
            </div>
            <span className="text-xs text-neutral-400">搜索</span>
          </button>
        </div>
      </div>

      {/* Calculator card */}
      <div className="mx-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}
        >
          {/* From */}
          <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-medium">发送</span>
              <button
                onClick={() => setShowFromPicker(v => !v)}
                className="flex items-center gap-1.5 bg-neutral-100 rounded-xl px-3 py-1.5"
              >
                <span className="text-sm font-bold text-neutral-900">{fromCurrency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-4xl font-bold text-neutral-900 bg-transparent outline-none font-['Outfit'] tracking-tight"
              placeholder="0"
            />
            <AnimatePresence>
              {showFromPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 mt-3">
                    {CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setFromCurrency(c); setShowFromPicker(false); }}
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                          fromCurrency === c ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center py-2 relative">
            <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-100" />
            <button
              onClick={swapCurrencies}
              className="relative z-10 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4 text-neutral-500" strokeWidth={2} />
            </button>
          </div>

          {/* To */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-400 font-medium">收款</span>
              <button
                onClick={() => setShowToPicker(v => !v)}
                className="flex items-center gap-1.5 bg-neutral-100 rounded-xl px-3 py-1.5"
              >
                <span className="text-sm font-bold text-neutral-900">{toCurrency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>
            </div>
            <div className="text-4xl font-bold text-neutral-300 font-['Outfit'] tracking-tight">
              {parseFloat(received) > 0 ? parseFloat(received).toLocaleString() : '0'}
            </div>
            <AnimatePresence>
              {showToPicker && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 mt-3">
                    {CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setToCurrency(c); setShowToPicker(false); }}
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
                          toCurrency === c ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rate row */}
          <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-between">
            <span className="text-xs text-neutral-400">参考汇率</span>
            <span className="text-xs font-semibold text-neutral-700">
              1 {fromCurrency} ≈ {rate} {toCurrency}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Transfer options */}
      <div className="mx-4 mt-3 space-y-2">
        {[
          { label: '银行转账', sub: 'SWIFT / SEPA', time: '1-3 工作日' },
          { label: '即时到账', sub: '实时网络', time: '< 1 分钟' },
        ].map(opt => (
          <motion.button
            key={opt.label}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm"
            style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-neutral-900">{opt.label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{opt.sub} · {opt.time}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400" strokeWidth={2} />
          </motion.button>
        ))}
      </div>

      {/* Continue button */}
      <div className="mx-4 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full bg-neutral-900 text-white rounded-2xl py-4 text-base font-semibold shadow-md"
        >
          继续
        </motion.button>
      </div>
    </div>
  );
}
