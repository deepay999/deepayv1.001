import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ChevronDown, ArrowDownLeft, Landmark } from 'lucide-react';

/* ── Crypto token data ───────────────────────────────────── */
const CRYPTO_TOKENS = [
  { symbol: 'USDT', name: 'TetherUS',   balance: '0,00', eur: '0,00', color: '#26A17B', letter: 'T' },
  { symbol: 'USDC', name: 'USDC',        balance: '0,00', eur: '0,00', color: '#2775CA', letter: 'U' },
  { symbol: 'BTC',  name: 'Bitcoin',     balance: '0,00', eur: '0,00', color: '#F7931A', letter: '₿' },
  { symbol: 'ETH',  name: 'Ethereum',    balance: '0,00', eur: '0,00', color: '#627EEA', letter: 'Ξ' },
  { symbol: 'SOL',  name: 'Solana',      balance: '0,00', eur: '0,00', color: '#9945FF', letter: 'S' },
  { symbol: 'BNB',  name: 'BNB',         balance: '0,00', eur: '0,00', color: '#F3BA2F', letter: 'B' },
];

const FIAT_TOKENS = [
  { symbol: 'EUR', name: 'Euro',          balance: '1,02', eur: '1,02', color: '#003087', letter: '€' },
  { symbol: 'USD', name: 'US Dollar',     balance: '0,00', eur: '0,00', color: '#1DA462', letter: '$' },
  { symbol: 'GBP', name: 'British Pound', balance: '0,00', eur: '0,00', color: '#CF142B', letter: '£' },
];

/* ── Token row ───────────────────────────────────────────── */
function TokenRow({
  token,
  index,
  visible,
}: {
  token: (typeof CRYPTO_TOKENS)[0];
  index: number;
  visible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center px-5 py-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer border-b border-neutral-100 last:border-0"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-white font-bold text-sm"
        style={{ background: token.color }}
      >
        {token.letter}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{token.symbol}</p>
        <p className="text-xs text-neutral-400">{token.name}</p>
      </div>

      {/* Balance */}
      <div className="text-right">
        <p className="text-sm font-semibold text-neutral-900 tabular-nums">
          {visible ? token.balance : '••••'}
        </p>
        <p className="text-xs text-neutral-400 tabular-nums">
          ≈ {visible ? token.eur : '••'} EUR
        </p>
      </div>
    </motion.div>
  );
}

/* ── main ────────────────────────────────────────────────── */
export function VaultsPage() {
  const [visible, setVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'crypto' | 'fiat'>('crypto');

  const tokens = activeTab === 'crypto' ? CRYPTO_TOKENS : FIAT_TOKENS;

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* ── Total assets header ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-5 pb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <button className="flex items-center gap-1 text-xs text-neutral-400 font-medium hover:text-neutral-600 transition-colors">
            Totale patrimonio stimato <ChevronDown className="w-3 h-3" />
          </button>
          <button onClick={() => setVisible(v => !v)} className="p-1 rounded-md hover:bg-neutral-50">
            {visible
              ? <Eye className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
              : <EyeOff className="w-3.5 h-3.5 text-neutral-400" strokeWidth={1.5} />
            }
          </button>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="font-['Outfit'] text-[42px] font-bold tracking-tight text-neutral-900 leading-none">
            {visible ? '0,00' : '••••'}
          </span>
          <button className="flex items-center gap-1 text-sm font-semibold text-neutral-700 mb-1 hover:bg-neutral-50 px-1 py-0.5 rounded-lg">
            EUR <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black text-white text-sm font-semibold"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Aggiungi fondi
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-800 text-sm font-semibold"
          >
            <Landmark className="w-4 h-4" />
            Credito
          </motion.button>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-neutral-200 px-5">
        {(['crypto', 'fiat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`mr-6 pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            {tab === 'crypto' ? 'Criptovalute' : 'Valute fiat'}
            {activeTab === tab && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Token list ── */}
      <div>
        {tokens.map((token, i) => (
          <TokenRow key={token.symbol} token={token} index={i} visible={visible} />
        ))}
      </div>

      {/* Bottom note */}
      <p className="px-5 py-4 text-xs text-neutral-400 text-center">
        I saldi in criptovaluta sono aggiornati in tempo reale.
        <br />Conformità MiCA · Regolamento UE 2023/1114
      </p>
    </div>
  );
}
