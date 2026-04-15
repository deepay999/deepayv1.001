import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, ArrowDownLeft, RefreshCw, Building2, ChevronRight } from 'lucide-react';
import { api, IbanInfo, IbanTransaction } from '../services/api';

/* ── fallback data ──────────────────────────────────────────── */
const FALLBACK_IBAN: IbanInfo = {
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'SWNBFRPP',
  balance: 1000.0,
};

const FALLBACK_TXS: IbanTransaction[] = [
  { id: 1, type: 'credit', amount: 500, description: 'Incoming SEPA', date: '2026-04-14' },
  { id: 2, type: 'credit', amount: 250, description: 'Wire Transfer', date: '2026-04-10' },
  { id: 3, type: 'credit', amount: 100, description: 'Payment received', date: '2026-04-05' },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handle} className="p-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors">
      <Copy className={`w-4 h-4 ${copied ? 'text-emerald-500' : 'text-neutral-400'}`} />
    </button>
  );
}

export function IBANPage() {
  const [info, setInfo] = useState<IbanInfo>(FALLBACK_IBAN);
  const [txs, setTxs] = useState<IbanTransaction[]>(FALLBACK_TXS);
  const [loading, setLoading] = useState(false);
  const [showReceive, setShowReceive] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ibanData, txData] = await Promise.all([api.getIban(), api.getIbanTransactions()]);
      setInfo(ibanData);
      if (Array.isArray(txData) && txData.length > 0) setTxs(txData);
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
          <h1 className="text-xl font-bold text-neutral-900">IBAN Account</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Swan banking details</p>
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

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 rounded-2xl bg-neutral-900 text-white p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-white/60" />
          <span className="text-xs text-white/60 font-medium">Swan IBAN Balance</span>
        </div>
        <p className="text-3xl font-bold mb-4">€{info.balance.toFixed(2)}</p>

        {/* IBAN / BIC rows */}
        {[
          { label: 'IBAN', value: info.iban },
          { label: 'BIC', value: info.bic },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-2 border-t border-white/10">
            <div>
              <p className="text-xs text-white/40 mb-0.5">{row.label}</p>
              <p className="text-sm font-mono text-white">{row.value}</p>
            </div>
            <CopyBtn text={row.value} />
          </div>
        ))}

        {/* Receive button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowReceive(v => !v)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Receive Payment
        </motion.button>
      </motion.div>

      {/* Receive details drawer */}
      <AnimatePresence>
        {showReceive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-4 mb-4 overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50"
          >
            <div className="p-4">
              <p className="text-xs font-semibold text-neutral-500 mb-2">Share your banking details</p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Send the IBAN and BIC above to anyone who wants to transfer funds to your account via SEPA bank transfer.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(`IBAN: ${info.iban}\nBIC: ${info.bic}`).catch(() => {})}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 px-3 py-2 rounded-xl"
              >
                <Copy className="w-3.5 h-3.5" /> Copy all details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent inflows */}
      <div className="px-5 pb-6">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Recent Inflows</p>
        {txs.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">No recent transactions</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 bg-neutral-50 rounded-2xl px-4 py-3"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{tx.description}</p>
                  <p className="text-xs text-neutral-400">{tx.date}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">+€{tx.amount.toFixed(2)}</span>
                <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
