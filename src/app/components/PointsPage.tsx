import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, TrendingUp, TrendingDown, Gift, Zap } from 'lucide-react';

/* ── mock data (replace with real API call) ─────────────────── */
const MOCK_EARN = [
  { id: 1, description: 'Referral bonus', amount: 200, date: '10 Apr. 2026' },
  { id: 2, description: 'First deposit reward', amount: 100, date: '01 Apr. 2026' },
  { id: 3, description: 'Loyalty reward', amount: 50, date: '20 Mar. 2026' },
];

const MOCK_USE = [
  { id: 1, description: 'Fee discount', amount: 30, date: '08 Apr. 2026' },
  { id: 2, description: 'Cashback redemption', amount: 50, date: '25 Mar. 2026' },
];

const TOTAL_EARNED = MOCK_EARN.reduce((s, r) => s + r.amount, 0);
const TOTAL_USED   = MOCK_USE.reduce((s, r) => s + r.amount, 0);
const BALANCE      = TOTAL_EARNED - TOTAL_USED;

/* ── sub-components ─────────────────────────────────────────── */
type Tab = 'earn' | 'use';

interface RecordItem {
  id: number;
  description: string;
  amount: number;
  date: string;
}

function RecordRow({ item, type }: { item: RecordItem; type: Tab }) {
  const positive = type === 'earn';
  return (
    <div className="flex items-center px-5 py-3 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 ${
          positive ? 'bg-emerald-50' : 'bg-red-50'
        }`}
      >
        {positive
          ? <TrendingUp  className="w-5 h-5 text-emerald-600" strokeWidth={1.8} />
          : <TrendingDown className="w-5 h-5 text-red-500"    strokeWidth={1.8} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{item.description}</p>
        <p className="text-xs text-neutral-400">{item.date}</p>
      </div>
      <span className={`text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {positive ? '+' : '-'}{item.amount} pts
      </span>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────── */
export function PointsPage() {
  const [tab, setTab] = useState<Tab>('earn');

  const records = tab === 'earn' ? MOCK_EARN : MOCK_USE;

  return (
    <div className="h-full overflow-y-auto bg-white">

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-xl font-bold text-neutral-900">Points</h1>
        <p className="text-sm text-neutral-400 mt-0.5">积分 · Reward points</p>
      </div>

      {/* ── Balance card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-4 mt-2 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden shadow-lg shadow-black/10"
      >
        <div className="px-5 pt-5 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-neutral-300">当前积分 · Balance</span>
          </div>

          <p className="text-5xl font-bold text-white tracking-tight font-['Outfit']">
            {BALANCE.toLocaleString()}
            <span className="text-2xl font-medium text-neutral-400 ml-2">pts</span>
          </p>

          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-neutral-400">Earned <span className="text-emerald-400 font-semibold">{TOTAL_EARNED}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-neutral-400">Used <span className="text-violet-400 font-semibold">{TOTAL_USED}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="mx-4 mt-4 flex gap-2">
        {(['earn', 'use'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {t === 'earn' ? '获得记录 · Earned' : '使用记录 · Used'}
          </button>
        ))}
      </div>

      {/* ── Records ── */}
      <div className="mt-3 pb-6">
        {records.length === 0 ? (
          <p className="text-center text-sm text-neutral-400 py-12">No records</p>
        ) : (
          records.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecordRow item={item} type={tab} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
