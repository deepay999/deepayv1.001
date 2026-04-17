import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownLeft, ArrowUpRight, RefreshCw, Repeat, Building2,
} from 'lucide-react';
import { api, Transaction } from '../services/api';

/* ── fallback data ──────────────────────────────────────────── */
const FALLBACK: Transaction[] = [
  { id: 1, type: 'credit', amount: 120.0, description: 'Payment received', date: '2026-04-15' },
  { id: 2, type: 'transfer', amount: 50.0, description: 'Transfer to Marco', date: '2026-04-14' },
  { id: 3, type: 'credit', amount: 350.0, description: 'SEPA inflow', date: '2026-04-13' },
  { id: 4, type: 'withdraw', amount: 200.0, description: 'Withdrawal', date: '2026-04-12' },
  { id: 5, type: 'debit', amount: 30.0, description: 'Utility payment', date: '2026-04-11' },
];

const TYPE_META: Record<
  string,
  { icon: React.ElementType; bg: string; iconColor: string; sign: string; amountClass: string }
> = {
  credit: {
    icon: ArrowDownLeft,
    bg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    sign: '+',
    amountClass: 'text-emerald-600',
  },
  debit: {
    icon: ArrowUpRight,
    bg: 'bg-neutral-100',
    iconColor: 'text-neutral-600',
    sign: '-',
    amountClass: 'text-neutral-800',
  },
  transfer: {
    icon: Repeat,
    bg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    sign: '-',
    amountClass: 'text-neutral-800',
  },
  withdraw: {
    icon: Building2,
    bg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    sign: '-',
    amountClass: 'text-neutral-800',
  },
};

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});
}

export function ActivityPage() {
  const [txs, setTxs] = useState<Transaction[]>(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | Transaction['type']>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      if (Array.isArray(data) && data.length > 0) setTxs(data);
    } catch {
      /* keep fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const FILTERS: Array<{ key: 'all' | Transaction['type']; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'credit', label: 'Credit' },
    { key: 'transfer', label: 'Transfer' },
    { key: 'withdraw', label: 'Withdraw' },
    { key: 'debit', label: 'Debit' },
  ];

  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter);
  const grouped = groupByDate(filtered);

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Activity</h1>
          <p className="text-sm text-neutral-400 mt-0.5">All your transactions</p>
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

      {/* Filter chips */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.93 }}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="pb-6">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">No transactions found</p>
        ) : (
          Object.entries(grouped).map(([date, dateTxs]) => (
            <div key={date}>
              <p className="px-5 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">{date}</p>
              {dateTxs.map((tx, i) => {
                const meta = TYPE_META[tx.type] ?? TYPE_META.debit;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center px-5 py-3 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 ${meta.bg}`}>
                      <Icon className={`w-5 h-5 ${meta.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{tx.description}</p>
                      <p className="text-xs text-neutral-400 capitalize">{tx.type}</p>
                    </div>
                    <span className={`text-sm font-semibold ${meta.amountClass}`}>
                      {meta.sign}€{tx.amount.toFixed(2)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
