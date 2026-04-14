import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Building2, Copy,
  Send, Download, RefreshCw, Gift, Star, ChevronRight,
  CheckCircle2, Clock, XCircle, AlertCircle, Eye, EyeOff,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LedgerEntry {
  id: number;
  trx: string;
  entry_type: 'debit' | 'credit';
  amount: number;
  currency: string;
  running_balance: number;
  description: string;
  remark: string;
  created_at: string;
}

interface SwanAccount {
  iban: string | null;
  bic: string | null;
  account_holder_name: string | null;
  currency: string;
  is_active: boolean;
  status: number;
}

interface AirwallexPayout {
  id: number;
  trx: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  payout_method: string;
  status: number;
  submitted_at: string | null;
  completed_at: string | null;
}

interface WalletDashboardProps {
  onBack?: () => void;
}

// ─── Mock data (replace with real API calls) ─────────────────────────────────

const MOCK_BALANCE  = 4_218.50;
const MOCK_POINTS   = 1_340;
const MOCK_SWAN: SwanAccount = {
  iban:                 'DE89 3704 0044 0532 0130 00',
  bic:                  'COBADEFFXXX',
  account_holder_name:  'Marco Rossi',
  currency:             'EUR',
  is_active:            true,
  status:               1,
};
const MOCK_LEDGER: LedgerEntry[] = [
  { id: 6, trx: 'A1B2C3D4E5F6G7H8', entry_type: 'credit', amount: 350,  currency: 'EUR', running_balance: 4218.50, description: 'Swan inbound transfer', remark: 'swan_deposit',       created_at: '2026-04-14T10:22:00Z' },
  { id: 5, trx: 'Z9Y8X7W6V5U4T3S2', entry_type: 'debit',  amount: 120,  currency: 'EUR', running_balance: 3868.50, description: 'Transfer to giulia_m',   remark: 'internal_transfer', created_at: '2026-04-13T14:35:00Z' },
  { id: 4, trx: 'Q1W2E3R4T5Y6U7I8', entry_type: 'debit',  amount: 500,  currency: 'EUR', running_balance: 3988.50, description: 'Payout to Fineco Bank',  remark: 'payout',            created_at: '2026-04-12T09:10:00Z' },
  { id: 3, trx: 'M1N2B3V4C5X6Z7A8', entry_type: 'credit', amount: 1000, currency: 'EUR', running_balance: 4488.50, description: 'Swan inbound transfer',  remark: 'swan_deposit',       created_at: '2026-04-10T08:00:00Z' },
  { id: 2, trx: 'P1O2I3U4Y5T6R7E8', entry_type: 'credit', amount: 200,  currency: 'EUR', running_balance: 3488.50, description: 'Transfer from luca_b',   remark: 'internal_transfer', created_at: '2026-04-09T16:45:00Z' },
  { id: 1, trx: 'S1D2F3G4H5J6K7L8', entry_type: 'credit', amount: 3288.50, currency: 'EUR', running_balance: 3288.50, description: 'Initial deposit', remark: 'swan_deposit',          created_at: '2026-04-01T00:00:00Z' },
];
const MOCK_PAYOUTS: AirwallexPayout[] = [
  { id: 2, trx: 'Q1W2E3R4T5Y6U7I8', amount: 500, currency: 'EUR', beneficiary_name: 'Fineco Bank',  payout_method: 'SEPA', status: 2, submitted_at: '2026-04-12T09:10:00Z', completed_at: '2026-04-12T14:05:00Z' },
  { id: 1, trx: 'A8B7C6D5E4F3G2H1', amount: 250, currency: 'EUR', beneficiary_name: 'PayPal Italy', payout_method: 'SWIFT', status: 2, submitted_at: '2026-04-05T11:00:00Z', completed_at: '2026-04-05T17:30:00Z' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
    >
      <AnimatePresence mode="wait">
        <motion.div key={copied ? 'ok' : 'cp'} initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-500' : 'text-neutral-400'}`} />
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

function fmt(n: number, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function payoutStatusIcon(status: number) {
  switch (status) {
    case 2:  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case 1:  return <Clock className="w-4 h-4 text-amber-500" />;
    case 3:  return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <AlertCircle className="w-4 h-4 text-neutral-400" />;
  }
}

function payoutStatusLabel(status: number) {
  return ['Pending', 'Processing', 'Completed', 'Failed', '', '', '', '', '', 'Cancelled'][status] ?? 'Unknown';
}

function remarkIcon(remark: string, type: 'debit' | 'credit') {
  if (remark === 'swan_deposit')       return { bg: '#E8F5E9', icon: <Download className="w-4 h-4 text-emerald-700" /> };
  if (remark === 'payout')             return { bg: '#FFF3E0', icon: <Send className="w-4 h-4 text-orange-700" /> };
  if (remark === 'internal_transfer' && type === 'debit')  return { bg: '#F3F3F3', icon: <ArrowUpRight className="w-4 h-4 text-neutral-700" /> };
  if (remark === 'internal_transfer' && type === 'credit') return { bg: '#E3F2FD', icon: <ArrowDownLeft className="w-4 h-4 text-blue-700" /> };
  return { bg: '#F3F3F3', icon: <Wallet className="w-4 h-4 text-neutral-700" /> };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BalanceCard({ balance, points, balanceVisible, onToggle }: { balance: number; points: number; balanceVisible: boolean; onToggle: () => void }) {
  return (
    <div className="mx-4 mt-4 rounded-2xl bg-neutral-900 p-5 text-white shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-widest">Saldo disponibile</span>
        <button onClick={onToggle} className="p-1">
          {balanceVisible ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
        </button>
      </div>
      <div className="text-3xl font-bold tracking-tight mb-3">
        {balanceVisible ? fmt(balance) : '€ ••••••'}
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-700">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="text-sm text-neutral-300">
          <span className="text-white font-semibold">{points.toLocaleString('it-IT')}</span> punti reward
        </span>
        <span className="ml-auto text-xs text-neutral-500">non convertibili in denaro</span>
      </div>
    </div>
  );
}

function IBANCard({ account }: { account: SwanAccount }) {
  return (
    <div className="mx-4 mt-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-800">IBAN dedicato • Swan</p>
          <p className="text-[10px] text-neutral-400">Conto individuale, nessun fondo condiviso</p>
        </div>
        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${account.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {account.is_active ? 'Attivo' : 'In attesa'}
        </span>
      </div>

      {account.iban ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-3 py-2">
            <div>
              <p className="text-[10px] text-neutral-400 mb-0.5">IBAN</p>
              <p className="text-xs font-mono font-medium text-neutral-800 tracking-wide">{account.iban}</p>
            </div>
            <CopyButton text={account.iban} />
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 bg-neutral-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-neutral-400 mb-0.5">BIC / SWIFT</p>
              <p className="text-xs font-mono font-medium text-neutral-800">{account.bic}</p>
            </div>
            <div className="flex-1 bg-neutral-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-neutral-400 mb-0.5">Intestatario</p>
              <p className="text-xs font-medium text-neutral-800 truncate">{account.account_holder_name}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-400 text-center py-2">In attesa di attivazione Swan...</p>
      )}
    </div>
  );
}

type ActiveModal = 'transfer' | 'payout' | 'redeem' | null;

function QuickActions({ onAction }: { onAction: (a: ActiveModal) => void }) {
  const actions = [
    { id: 'transfer' as const, icon: <Send className="w-5 h-5" />, label: 'Trasferisci', color: 'bg-neutral-900 text-white' },
    { id: 'payout'   as const, icon: <ArrowUpRight className="w-5 h-5" />, label: 'Payout', color: 'bg-blue-600 text-white' },
    { id: 'redeem'   as const, icon: <Gift className="w-5 h-5" />, label: 'Riscatta', color: 'bg-amber-500 text-white' },
  ];
  return (
    <div className="mx-4 mt-3 flex gap-2">
      {actions.map(a => (
        <motion.button
          key={a.id}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAction(a.id)}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl ${a.color} shadow-sm`}
        >
          {a.icon}
          <span className="text-[11px] font-semibold">{a.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function LedgerList({ entries }: { entries: LedgerEntry[] }) {
  return (
    <div className="mx-4 mt-4">
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">Registro movimenti</h3>
      <div className="space-y-2">
        {entries.map(entry => {
          const { bg, icon } = remarkIcon(entry.remark, entry.entry_type);
          const isCredit = entry.entry_type === 'credit';
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-100 shadow-sm"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-800 truncate">{entry.description}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{fmtDate(entry.created_at)} · {entry.trx.slice(0, 8)}…</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-neutral-800'}`}>
                  {isCredit ? '+' : '-'}{fmt(entry.amount, entry.currency)}
                </p>
                <p className="text-[10px] text-neutral-400">{fmt(entry.running_balance, entry.currency)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PayoutList({ payouts }: { payouts: AirwallexPayout[] }) {
  return (
    <div className="mx-4 mt-4">
      <h3 className="text-sm font-semibold text-neutral-800 mb-2">Payout Airwallex</h3>
      <div className="space-y-2">
        {payouts.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-neutral-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-800 truncate">{p.beneficiary_name}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{p.payout_method} · {p.trx.slice(0, 8)}…</p>
            </div>
            <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
              <p className="text-sm font-bold text-neutral-800">{fmt(p.amount, p.currency)}</p>
              <div className="flex items-center gap-1">
                {payoutStatusIcon(p.status)}
                <span className="text-[10px] text-neutral-500">{payoutStatusLabel(p.status)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function TransferModal({ onClose }: { onClose: () => void }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [description, setDesc]    = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-lg font-bold">Trasferimento inviato</p>
            <p className="text-sm text-neutral-500">Il saldo verrà aggiornato a breve</p>
            <button onClick={onClose} className="mt-4 w-full py-3 rounded-2xl bg-neutral-900 text-white font-semibold">Chiudi</button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold mb-4">Trasferisci internamente</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Username o numero di telefono"
                value={recipient} onChange={e => setRecipient(e.target.value)} required
              />
              <input
                type="number" min="0.01" step="0.01"
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Importo (EUR)"
                value={amount} onChange={e => setAmount(e.target.value)} required
              />
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Descrizione (opzionale)"
                value={description} onChange={e => setDesc(e.target.value)}
              />
              <button type="submit" className="w-full py-3 rounded-2xl bg-neutral-900 text-white font-semibold text-sm">
                Conferma trasferimento
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

function PayoutModal({ onClose }: { onClose: () => void }) {
  const [name, setName]       = useState('');
  const [iban, setIban]       = useState('');
  const [amount, setAmount]   = useState('');
  const [country, setCountry] = useState('IT');
  const [method, setMethod]   = useState('SEPA');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-12 h-12 text-blue-500" />
            <p className="text-lg font-bold">Payout avviato</p>
            <p className="text-sm text-neutral-500 text-center">Il pagamento è in elaborazione via Airwallex</p>
            <button onClick={onClose} className="mt-4 w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold">Chiudi</button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold mb-4">Payout esterno · Airwallex</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome beneficiario"
                value={name} onChange={e => setName(e.target.value)} required
              />
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="IBAN / Numero conto"
                value={iban} onChange={e => setIban(e.target.value)} required
              />
              <div className="flex gap-2">
                <input
                  type="number" min="1" step="0.01"
                  className="flex-1 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Importo (EUR)"
                  value={amount} onChange={e => setAmount(e.target.value)} required
                />
                <select
                  className="w-24 border border-neutral-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={method} onChange={e => setMethod(e.target.value)}
                >
                  <option>SEPA</option>
                  <option>SWIFT</option>
                  <option>LOCAL</option>
                </select>
              </div>
              <input
                maxLength={2}
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paese beneficiario (es. IT)"
                value={country} onChange={e => setCountry(e.target.value.toUpperCase())} required
              />
              <p className="text-[10px] text-neutral-400">
                Il saldo verrà addebitato immediatamente. Nessun fondo condiviso.
              </p>
              <button type="submit" className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold text-sm">
                Avvia payout
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

function RedeemModal({ points, onClose }: { points: number; onClose: () => void }) {
  const [pts, setPts]         = useState('');
  const [reason, setReason]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(pts) > points) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Star className="w-12 h-12 text-amber-400" />
            <p className="text-lg font-bold">Punti riscattati!</p>
            <p className="text-sm text-neutral-500 text-center">I punti non sono convertibili in denaro</p>
            <button onClick={onClose} className="mt-4 w-full py-3 rounded-2xl bg-amber-500 text-white font-semibold">Chiudi</button>
          </div>
        ) : (
          <>
            <h2 className="text-base font-bold mb-1">Riscatta punti reward</h2>
            <p className="text-xs text-neutral-400 mb-4">Saldo attuale: <strong>{points.toLocaleString('it-IT')} pt</strong> · I punti non hanno valore monetario</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number" min="1" max={points} step="1"
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={`Punti da riscattare (max ${points.toLocaleString('it-IT')})`}
                value={pts} onChange={e => setPts(e.target.value)} required
              />
              <input
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Motivo riscatto (es. sconto commissioni)"
                value={reason} onChange={e => setReason(e.target.value)} required
              />
              <button type="submit" className="w-full py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm">
                Riscatta punti
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type Tab = 'ledger' | 'payouts';

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'ledger',  label: 'Registro' },
    { id: 'payouts', label: 'Payout' },
  ];
  return (
    <div className="mx-4 mt-4 flex gap-2 border-b border-neutral-100 pb-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            active === t.id ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WalletDashboard({ onBack }: WalletDashboardProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab]           = useState<Tab>('ledger');
  const [modal, setModal]                   = useState<ActiveModal>(null);

  return (
    <div className="h-full overflow-y-auto bg-neutral-50 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-neutral-600">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-neutral-800" />
          <h1 className="text-base font-bold text-neutral-900">Portafoglio</h1>
        </div>
        <button className="p-2 -mr-2">
          <RefreshCw className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Balance card */}
      <BalanceCard
        balance={MOCK_BALANCE}
        points={MOCK_POINTS}
        balanceVisible={balanceVisible}
        onToggle={() => setBalanceVisible(v => !v)}
      />

      {/* IBAN card */}
      <IBANCard account={MOCK_SWAN} />

      {/* Quick actions */}
      <QuickActions onAction={setModal} />

      {/* Tab bar */}
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'ledger' ? (
          <motion.div key="ledger" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <LedgerList entries={MOCK_LEDGER} />
          </motion.div>
        ) : (
          <motion.div key="payouts" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <PayoutList payouts={MOCK_PAYOUTS} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'transfer' && <TransferModal onClose={() => setModal(null)} />}
        {modal === 'payout'   && <PayoutModal   onClose={() => setModal(null)} />}
        {modal === 'redeem'   && <RedeemModal   points={MOCK_POINTS} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  );
}
