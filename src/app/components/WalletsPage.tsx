import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Repeat,
  TrendingUp, RefreshCw, ChevronRight, Filter,
} from 'lucide-react';

/* ── Types ────────────────────────────────────────────────── */
interface WalletBalance {
  currency: string;
  total: number;
  available: number;
  frozen: number;
}

interface LedgerEntry {
  id: number;
  currency: string;
  amount: number;
  type: 'credit' | 'debit';
  reference_type: string;
  description: string;
  running_balance: number;
  created_at: string;
}

interface WalletsPageProps {
  /** When true, the Transfer quick-action is pre-highlighted */
  showTransferTab?: boolean;
}

/* ── Currency config ──────────────────────────────────────── */
const CURRENCY_META: Record<string, { symbol: string; flag: string; color: string }> = {
  EUR: { symbol: '€', flag: '🇪🇺', color: '#2563EB' },
  USD: { symbol: '$', flag: '🇺🇸', color: '#16A34A' },
  GBP: { symbol: '£', flag: '🇬🇧', color: '#7C3AED' },
};

/* ── Helpers ──────────────────────────────────────────────── */
function formatAmount(amount: number, currency: string): string {
  const meta = CURRENCY_META[currency];
  const abs  = Math.abs(amount);
  return `${amount < 0 ? '-' : ''}${meta?.symbol ?? ''}${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeDate(dateStr: string): string {
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function txIcon(entry: LedgerEntry) {
  const ref = entry.reference_type ?? '';
  if (ref.includes('transfer') || ref.includes('send_money')) return { Icon: Repeat,        bg: '#3B82F6', color: '#fff' };
  if (entry.type === 'credit')                                  return { Icon: ArrowDownLeft, bg: '#F0FDF4', color: '#16A34A' };
  return { Icon: ArrowUpRight, bg: '#FEF2F2', color: '#DC2626' };
}

/* ── Mock data (used when API is unavailable) ─────────────── */
const MOCK_WALLETS: WalletBalance[] = [
  { currency: 'EUR', total: 1250.00, available: 1250.00, frozen: 0 },
  { currency: 'USD', total: 320.50,  available: 320.50,  frozen: 0 },
  { currency: 'GBP', total: 0,       available: 0,       frozen: 0 },
];

const MOCK_LEDGER: LedgerEntry[] = [
  { id: 1, currency: 'EUR', amount: 350,  type: 'credit', reference_type: 'airwallex_payment', description: 'Card payment received',        running_balance: 1250, created_at: new Date(Date.now() - 86400000 * 0).toISOString() },
  { id: 2, currency: 'EUR', amount: -120, type: 'debit',  reference_type: 'p2p_transfer',       description: 'Transfer to Marco',             running_balance: 900,  created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 3, currency: 'USD', amount: 320.50, type: 'credit', reference_type: 'airwallex_payment', description: 'USD payment received',          running_balance: 320.50, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 4, currency: 'EUR', amount: -49,  type: 'debit',  reference_type: 'p2p_transfer',       description: 'Transfer to Sofia',             running_balance: 1020, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 5, currency: 'EUR', amount: 0.01, type: 'credit', reference_type: 'cashback',            description: '4% platform yield',             running_balance: 1020.01, created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
];

/* ── Component ────────────────────────────────────────────── */
export function WalletsPage({ showTransferTab = false }: WalletsPageProps) {
  const [wallets,         setWallets]         = useState<WalletBalance[]>(MOCK_WALLETS);
  const [ledger,          setLedger]          = useState<LedgerEntry[]>(MOCK_LEDGER);
  const [activeCurrency,  setActiveCurrency]  = useState<string>('EUR');
  const [rewardPoints,    setRewardPoints]    = useState<number>(0);
  const [loading,         setLoading]         = useState(false);
  const [filterCurrency,  setFilterCurrency]  = useState<string | null>(null);

  /* Fetch from API when a token is available */
  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (!token) return;

    setLoading(true);

    Promise.all([
      fetch('/api/wallets',         { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/wallets/ledger',  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([walletRes, ledgerRes]) => {
        if (walletRes.data?.wallets)  setWallets(walletRes.data.wallets);
        if (walletRes.data?.reward_points !== undefined) setRewardPoints(walletRes.data.reward_points);
        if (ledgerRes.data?.ledger?.data) setLedger(ledgerRes.data.ledger.data);
      })
      .catch(() => { /* stay on mock data */ })
      .finally(() => setLoading(false));
  }, []);

  const activeWallet = wallets.find(w => w.currency === activeCurrency) ?? wallets[0];
  const meta         = CURRENCY_META[activeCurrency] ?? { symbol: '', flag: '', color: '#333' };

  const filteredLedger = filterCurrency
    ? ledger.filter(e => e.currency === filterCurrency)
    : ledger;

  /* Group ledger by relative date */
  const grouped: Record<string, LedgerEntry[]> = {};
  filteredLedger.forEach(e => {
    const key = relativeDate(e.created_at);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Wallets</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Multi-currency accounts</p>
        </div>
        {loading && <RefreshCw className="w-4 h-4 text-neutral-400 animate-spin" />}
      </div>

      {/* ── Currency Selector ── */}
      <div className="flex gap-2 px-5 overflow-x-auto pb-1 no-scrollbar">
        {wallets.map(w => {
          const m      = CURRENCY_META[w.currency];
          const active = activeCurrency === w.currency;
          return (
            <motion.button
              key={w.currency}
              onClick={() => setActiveCurrency(w.currency)}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                active
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              <span>{m?.flag}</span>
              <span>{w.currency}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Active Wallet Card ── */}
      <AnimatePresence mode="wait">
        {activeWallet && (
          <motion.div
            key={activeCurrency}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-4 mt-3 rounded-2xl overflow-hidden shadow-sm"
            style={{ background: `linear-gradient(135deg, ${meta.color}18, ${meta.color}08)`, border: `1px solid ${meta.color}22` }}
          >
            <div className="px-5 py-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{meta.flag} {activeCurrency} Account</p>
                  <p className="text-4xl font-bold text-neutral-900 mt-1 tracking-tight font-['Outfit']">
                    {meta.symbol}{activeWallet.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">Available balance</p>
                </div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${meta.color}15` }}>
                  <Wallet className="w-5 h-5" style={{ color: meta.color }} />
                </div>
              </div>

              {activeWallet.frozen > 0 && (
                <div className="flex items-center justify-between text-sm bg-amber-50 rounded-xl px-3 py-2">
                  <span className="text-amber-700 font-medium">🔒 Frozen</span>
                  <span className="text-amber-800 font-semibold">{meta.symbol}{activeWallet.frozen.toFixed(2)}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {['Add money', 'Transfer', 'Withdraw'].map(action => (
                  <motion.button
                    key={action}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      action === 'Transfer' && showTransferTab
                        ? 'bg-neutral-900 text-white shadow'
                        : 'bg-white text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reward Points Banner ── */}
      {rewardPoints > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 px-4 py-3 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-violet-600 uppercase tracking-wide">Reward Points</p>
            <p className="text-xl font-bold text-violet-900">{rewardPoints.toLocaleString()} pts</p>
            <p className="text-[10px] text-violet-400 mt-0.5">Platform use only · not withdrawable</p>
          </div>
          <TrendingUp className="w-8 h-8 text-violet-300" />
        </motion.div>
      )}

      {/* ── Ledger History ── */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-900">Transaction History</h2>
          <button
            onClick={() => setFilterCurrency(fc => fc ? null : activeCurrency)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
              filterCurrency ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            <Filter className="w-3 h-3" />
            {filterCurrency ?? 'All'}
          </button>
        </div>

        {Object.entries(grouped).length === 0 && (
          <div className="text-center py-10 text-neutral-400 text-sm">No transactions yet</div>
        )}

        {Object.entries(grouped).map(([date, entries]) => (
          <div key={date} className="mb-4">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-2">{date}</p>
            <div className="space-y-1">
              {entries.map(entry => {
                const { Icon, bg, color } = txIcon(entry);
                const m = CURRENCY_META[entry.currency] ?? { symbol: '' };
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                      <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{entry.description}</p>
                      <p className="text-[11px] text-neutral-400">{entry.reference_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${entry.amount > 0 ? 'text-emerald-600' : 'text-neutral-800'}`}>
                        {entry.amount > 0 ? '+' : ''}{formatAmount(entry.amount, entry.currency)}
                      </p>
                      <p className="text-[10px] text-neutral-400">{entry.currency}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom padding for nav bar */}
        <div className="h-6" />
      </div>
    </div>
  );
}
