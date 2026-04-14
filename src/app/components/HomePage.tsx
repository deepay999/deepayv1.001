import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Copy, ChevronDown, Download, FileText,
  Search, Sparkles, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Repeat, Percent, Eye, EyeOff, X, Gift, Banknote,
} from 'lucide-react';

interface HomePageProps {
  onAddMoney: () => void;
  onTransfer: () => void;
  onWithdraw?: () => void;
  onOpenProfile: () => void;
}

/* ── helpers ─────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="p-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors flex-shrink-0">
      <AnimatePresence mode="wait">
        {copied
          ? <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="w-4 h-4 text-emerald-500" /></motion.div>
          : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}><Copy className="w-4 h-4 text-neutral-400" /></motion.div>
        }
      </AnimatePresence>
    </button>
  );
}

const TRANSACTIONS = [
  { id: 1, date: '08 Apr. 2026', title: 'Rendimento 4%', time: '02:13', amount: '+€0,01', icon: Percent, bg: '#1A1A1A', color: '#fff', positive: true },
  { id: 2, date: '22 Mar. 2026', title: 'EUR → SOL', subtitle: '0,63 SOL', time: '05:22', amount: '€49', icon: Repeat, bg: '#3B82F6', color: '#fff', positive: false },
  { id: 3, date: '21 Mar. 2026', title: 'Trasferimento a Marco', time: '14:35', amount: '-€120', icon: ArrowUpRight, bg: '#F3F3F3', color: '#333', positive: false },
  { id: 4, date: '20 Mar. 2026', title: 'Pagamento ricevuto', time: '09:10', amount: '+€350', icon: ArrowDownLeft, bg: '#F3F3F3', color: '#333', positive: true },
];

const IBAN = 'IT89 1774 8019 84IT 3931 6333 343';
const IBAN_SHORT = 'IT89 1774 8 ... 3931 6333 343';
const BIC = 'DEEPIT22XXX';
const BENEFICIARY = 'La mia azienda';

export function HomePage({ onAddMoney, onTransfer, onWithdraw, onOpenProfile }: HomePageProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [dismissReferral, setDismissReferral] = useState(false);

  // Group transactions by date
  const grouped: Record<string, typeof TRANSACTIONS> = {};
  TRANSACTIONS.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date].push(tx);
  });

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={onOpenProfile} className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-neutral-300 to-neutral-200 flex items-center justify-center">
          <span className="text-sm font-semibold text-neutral-600">U</span>
        </button>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full hover:bg-neutral-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-500" strokeWidth={1.5} />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-neutral-50 flex items-center justify-center">
            <Search className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-4 mt-2 rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4">
          {/* Balance row */}
          <div className="flex items-start justify-between mb-1">
            <button
              className="flex items-baseline gap-0.5 group"
              onClick={() => setBalanceVisible(v => !v)}
            >
              <span className="text-2xl font-light text-neutral-400">€</span>
              <span className="text-[48px] font-bold leading-none text-neutral-900 tracking-tight font-['Outfit']">
                {balanceVisible ? '1' : '••'}
              </span>
              <span className="text-[28px] font-bold text-neutral-400 leading-none">{balanceVisible ? ',02' : ''}</span>
            </button>
            <div className="flex items-center gap-2 mt-2">
              <button
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:bg-neutral-50 px-2 py-1 rounded-lg"
              >
                EUR <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              <button onClick={() => setBalanceVisible(v => !v)} className="p-1 rounded-lg hover:bg-neutral-50">
                {balanceVisible ? <Eye className="w-4 h-4 text-neutral-400" /> : <EyeOff className="w-4 h-4 text-neutral-400" />}
              </button>
            </div>
          </div>

          {/* IBAN row */}
          <button
            onClick={() => setShowAccountDetails(v => !v)}
            className="flex items-center gap-2 text-sm text-neutral-500 mb-1 hover:text-neutral-700 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{IBAN_SHORT}</span>
          </button>

          {/* Yield badge */}
          <div className="flex items-center gap-1 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-500">4%</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onAddMoney}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-black text-white text-xs font-semibold"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Ricevi
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onTransfer}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border border-neutral-200 bg-white text-neutral-800 text-xs font-semibold"
            >
              <ArrowUpRight className="w-4 h-4" />
              Invia
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onWithdraw}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border border-neutral-200 bg-white text-neutral-800 text-xs font-semibold"
            >
              <Banknote className="w-4 h-4" />
              Preleva
            </motion.button>
          </div>

          {/* Account details drawer */}
          <AnimatePresence>
            {showAccountDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                  {[
                    { label: 'Beneficiario', value: BENEFICIARY },
                    { label: 'IBAN', value: IBAN },
                    { label: 'BIC', value: BIC },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-500 mb-0.5">{row.label}</p>
                        <p className="text-sm font-mono text-neutral-800 leading-snug">{row.value}</p>
                      </div>
                      <CopyButton text={row.value} />
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                      <FileText className="w-4 h-4" /> Esporta
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                      <Download className="w-4 h-4" /> Estratto
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Today Stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-3 grid grid-cols-2 gap-3"
      >
        <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-0.5">Entrate oggi</p>
            <p className="text-sm font-bold text-emerald-600">+€120</p>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-0.5">Uscite oggi</p>
            <p className="text-sm font-bold text-rose-500">-€30</p>
          </div>
        </div>
      </motion.div>

      {/* ── Referral Card ── */}
      <AnimatePresence>
        {!dismissReferral && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-4 mt-3 rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">€100 per ogni referral</p>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  Ricevi €100 per ogni amico che si registra entro il 23 aprile.
                </p>
              </div>
              <button onClick={() => setDismissReferral(true)} className="p-1 rounded-lg hover:bg-neutral-100 flex-shrink-0">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transactions ── */}
      <div className="mt-4 pb-4">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="px-5 py-2 text-sm text-neutral-400 font-medium">{date}</p>
            {txs.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center px-5 py-3 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mr-3 flex-shrink-0"
                  style={{ background: tx.bg }}
                >
                  <tx.icon className="w-5 h-5" style={{ color: tx.color }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{tx.title}</p>
                  <p className="text-xs text-neutral-400">{tx.time}{tx.subtitle ? ` · ${tx.subtitle}` : ''}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.positive ? 'text-emerald-600' : 'text-neutral-800'}`}>
                  {tx.amount}
                </span>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
