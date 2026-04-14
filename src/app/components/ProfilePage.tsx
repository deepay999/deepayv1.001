import { motion } from 'motion/react';
import {
  ShieldCheck, BarChart2, Lock, KeyRound,
  ChevronRight, Copy, CheckCircle2, Clock,
} from 'lucide-react';
import { useState } from 'react';

interface ProfilePageProps {
  onBack?: () => void;
  onViewWebsite?: () => void;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
    >
      {copied
        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        : <Copy className="w-4 h-4 text-neutral-400" />}
    </button>
  );
}

const KYC_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  verified:  { label: 'Verificato',    bg: 'bg-emerald-50', text: 'text-emerald-700' },
  pending:   { label: 'In revisione',  bg: 'bg-amber-50',   text: 'text-amber-700'   },
  rejected:  { label: 'Rifiutato',     bg: 'bg-rose-50',    text: 'text-rose-700'    },
};

const KYC_STATUS: keyof typeof KYC_BADGE = 'verified';

const API_KEY = 'dp_live_xK9mN2pQrT7vYwZ4aB1cD8eF3gH6jL0';

const MENU_ITEMS = [
  {
    icon: ShieldCheck,
    label: 'KYC Status',
    description: 'Verifica identità',
    badge: KYC_BADGE[KYC_STATUS],
  },
  {
    icon: BarChart2,
    label: 'Limiti',
    description: 'Soglie giornaliere e mensili',
    badge: null,
  },
  {
    icon: Lock,
    label: 'Sicurezza',
    description: 'Password, 2FA, dispositivi',
    badge: null,
  },
  {
    icon: KeyRound,
    label: 'API Keys',
    description: 'Integrazione B2B / sviluppatori',
    badge: null,
  },
];

export function ProfilePage({ onBack, onViewWebsite }: ProfilePageProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Profilo</h1>
      </div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-5 p-5 rounded-2xl bg-neutral-900 text-white flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold flex-shrink-0">
          U
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">med****@gmail.com</p>
          <p className="text-xs text-white/50 mt-0.5">UID: 1874957242</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${KYC_BADGE[KYC_STATUS].bg} ${KYC_BADGE[KYC_STATUS].text}`}>
          {KYC_BADGE[KYC_STATUS].label}
        </div>
      </motion.div>

      {/* Menu */}
      <div className="px-4 space-y-2">
        {MENU_ITEMS.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl border border-neutral-100 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{item.description}</p>
            </div>
            {item.badge ? (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${item.badge.bg} ${item.badge.text}`}>
                {item.badge.label}
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            )}
          </motion.button>
        ))}

        {/* API Key section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 py-4 rounded-2xl border border-neutral-100 bg-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">API Key live</p>
              <p className="text-xs text-neutral-400">Per integrazioni B2B</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <CopyBtn text={API_KEY} />
            </div>
          </div>

          <button
            onClick={() => setShowApiKey(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-100 text-left"
          >
            <code className="flex-1 text-xs font-mono text-neutral-600 truncate">
              {showApiKey ? API_KEY : '••••••••••••••••••••••••••••••'}
            </code>
            <span className="text-xs text-neutral-400 flex-shrink-0">{showApiKey ? 'Nascondi' : 'Mostra'}</span>
          </button>

          <div className="flex items-center gap-1.5 mt-2.5">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-400">Generata il 01 Apr. 2026 · Scade tra 365 giorni</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
