import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDownLeft, ArrowUpRight, Repeat, Banknote, ChevronRight,
} from 'lucide-react';

type FilterKey = 'all' | 'in' | 'out' | 'transfer' | 'withdraw';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'Tutti' },
  { key: 'in',       label: 'Entrate' },
  { key: 'out',      label: 'Uscite' },
  { key: 'transfer', label: 'Trasferimenti' },
  { key: 'withdraw', label: 'Prelievi' },
];

interface Activity {
  id: number;
  type: FilterKey;
  date: string;
  title: string;
  subtitle?: string;
  amount: string;
  positive: boolean;
}

const ACTIVITIES: Activity[] = [
  { id:  1, type: 'in',       date: '14 Apr. 2026', title: 'Pagamento ricevuto',     subtitle: 'Marco Bianchi',  amount: '+€500,00', positive: true  },
  { id:  2, type: 'in',       date: '14 Apr. 2026', title: 'Rendimento 4%',                                       amount: '+€0,42',   positive: true  },
  { id:  3, type: 'out',      date: '13 Apr. 2026', title: 'Netflix',                subtitle: 'Abbonamento',    amount: '-€15,99',  positive: false },
  { id:  4, type: 'transfer', date: '12 Apr. 2026', title: 'Trasferimento a Laura',                               amount: '-€120,00', positive: false },
  { id:  5, type: 'withdraw', date: '10 Apr. 2026', title: 'Prelievo SEPA',           subtitle: 'Banca Sella',   amount: '-€200,00', positive: false },
  { id:  6, type: 'in',       date: '10 Apr. 2026', title: 'Pagamento ricevuto',     subtitle: 'Acme S.r.l.',   amount: '+€1.200,00', positive: true },
  { id:  7, type: 'transfer', date: '08 Apr. 2026', title: 'Trasferimento a Giulio',                             amount: '-€50,00',  positive: false },
  { id:  8, type: 'out',      date: '06 Apr. 2026', title: 'Spotify',                subtitle: 'Abbonamento',   amount: '-€10,99',  positive: false },
  { id:  9, type: 'withdraw', date: '02 Apr. 2026', title: 'Prelievo SEPA',           subtitle: 'BBVA',          amount: '-€350,00', positive: false },
  { id: 10, type: 'in',       date: '01 Apr. 2026', title: 'Bonifico in entrata',    subtitle: 'Luca Verdi',    amount: '+€80,00',  positive: true  },
];

const TYPE_ICON: Record<FilterKey, React.ElementType> = {
  all:      ArrowDownLeft,
  in:       ArrowDownLeft,
  out:      ArrowUpRight,
  transfer: Repeat,
  withdraw: Banknote,
};

const TYPE_BG: Record<FilterKey, string> = {
  all:      'bg-neutral-100',
  in:       'bg-emerald-50',
  out:      'bg-rose-50',
  transfer: 'bg-blue-50',
  withdraw: 'bg-orange-50',
};

const TYPE_COLOR: Record<FilterKey, string> = {
  all:      'text-neutral-600',
  in:       'text-emerald-600',
  out:      'text-rose-600',
  transfer: 'text-blue-600',
  withdraw: 'text-orange-600',
};

export function ActivityPage() {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all'
    ? ACTIVITIES
    : ACTIVITIES.filter(a => a.type === filter);

  // Group by date
  const grouped: Record<string, Activity[]> = {};
  filtered.forEach(a => {
    if (!grouped[a.date]) grouped[a.date] = [];
    grouped[a.date].push(a);
  });

  const Icon = TYPE_ICON[filter];

  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Attività</h1>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Icon className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.2} />
              <p className="text-sm">Nessuna transazione</p>
            </div>
          )}

          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="px-5 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest">{date}</p>
              {txs.map((tx, i) => {
                const TxIcon = TYPE_ICON[tx.type];
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center px-5 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0 ${TYPE_BG[tx.type]}`}>
                      <TxIcon className={`w-5 h-5 ${TYPE_COLOR[tx.type]}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{tx.title}</p>
                      {tx.subtitle && (
                        <p className="text-xs text-neutral-400 truncate">{tx.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-semibold ${tx.positive ? 'text-emerald-600' : 'text-neutral-800'}`}>
                        {tx.amount}
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-300" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
