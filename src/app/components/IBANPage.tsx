import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Copy, ChevronRight, ArrowDownLeft, CheckCircle2,
} from 'lucide-react';

const IBAN = 'FR76 3000 6000 0112 3456 7890 189';
const BIC  = 'BNPAFRPPXXX';
const BENEFICIARY = 'DeePay – La mia azienda';

interface InboundTx {
  id: number;
  date: string;
  sender: string;
  amount: number;
  currency: string;
  reference: string;
}

const INBOUND: InboundTx[] = [
  { id: 1, date: '14 Apr. 2026', sender: 'Marco Bianchi',    amount: 500,  currency: 'EUR', reference: 'Rimborso cena' },
  { id: 2, date: '10 Apr. 2026', sender: 'Acme S.r.l.',       amount: 1200, currency: 'EUR', reference: 'Fattura #0042' },
  { id: 3, date: '02 Apr. 2026', sender: 'Luca Verdi',        amount: 80,   currency: 'EUR', reference: 'Regalo' },
  { id: 4, date: '28 Mar. 2026', sender: 'PayPal Europe',     amount: 230,  currency: 'EUR', reference: 'Rimessa da PayPal' },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handle}
      className="p-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
    >
      <AnimatePresence mode="wait">
        {copied
          ? <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </motion.div>
          : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Copy className="w-4 h-4 text-neutral-400" />
            </motion.div>
        }
      </AnimatePresence>
    </button>
  );
}

export function IBANPage() {
  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Il tuo IBAN</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Ricevi bonifici direttamente su questo conto</p>
      </div>

      {/* IBAN Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-5 rounded-2xl bg-neutral-900 p-5 text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-white/60" />
          <span className="text-sm font-medium text-white/60">Conto Bancario</span>
        </div>

        {[
          { label: 'Beneficiario', value: BENEFICIARY },
          { label: 'IBAN',        value: IBAN },
          { label: 'BIC / SWIFT', value: BIC },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
            <div>
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-0.5">{row.label}</p>
              <p className="text-sm font-mono text-white leading-snug">{row.value}</p>
            </div>
            <CopyBtn text={row.value} />
          </div>
        ))}

        {/* Copy IBAN button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { navigator.clipboard.writeText(IBAN).catch(() => {}); }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 transition-colors text-sm font-semibold text-white"
        >
          <Copy className="w-4 h-4" />
          Copia IBAN
        </motion.button>
      </motion.div>

      {/* Incoming Transactions */}
      <div className="px-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Transazioni in entrata</p>

        <div className="rounded-2xl border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
          {INBOUND.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center px-4 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mr-3 flex-shrink-0">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">{tx.sender}</p>
                <p className="text-xs text-neutral-400 truncate">{tx.date} · {tx.reference}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-emerald-600">
                  +€{tx.amount.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-300 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
