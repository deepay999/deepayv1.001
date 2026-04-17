import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User, ChevronDown, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const CURRENCIES = ['EUR', 'USD', 'GBP'];

const RECENT_CONTACTS = [
  { name: 'Marco Rossi', avatar: 'MR', id: 'user_001' },
  { name: 'Sara Conti', avatar: 'SC', id: 'user_002' },
  { name: 'Luca Ferrari', avatar: 'LF', id: 'user_003' },
];

type Step = 'input' | 'processing' | 'success' | 'error';

export function TransferPage() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [transferId, setTransferId] = useState('');

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

  const selectContact = (c: { name: string; id: string }) => {
    setRecipient(c.name);
    setRecipientId(c.id);
  };

  const reset = () => {
    setStep('input');
    setAmount('');
    setRecipient('');
    setRecipientId('');
    setTransferId('');
  };

  const handleTransfer = async () => {
    if (!amount || (!recipientId && !recipient)) return;
    setStep('processing');
    try {
      const res = await api.createTransfer({
        to_user_id: recipientId || recipient,
        amount: parseFloat(amount),
        currency,
      });
      setTransferId(res.transfer_id);
      setStep('success');
    } catch {
      setStep('error');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">Transfer</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Send money to anyone instantly</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-8 py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-10 h-10 text-white" strokeWidth={3} />
            </motion.div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Transfer Complete!</h2>
            <p className="text-neutral-500 text-center mb-2">
              {symbol}{amount} sent to {recipient}
            </p>
            {transferId && (
              <p className="text-xs text-neutral-400 font-mono mb-8">ID: {transferId}</p>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={reset}
              className="px-6 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-semibold"
            >
              New Transfer
            </motion.button>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-8 py-16"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Transfer Failed</h2>
            <p className="text-neutral-500 text-center mb-8">Something went wrong. Please try again.</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={reset}
              className="px-6 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-semibold"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center px-8 py-20"
          >
            <Loader2 className="w-12 h-12 text-neutral-400 animate-spin mb-4" />
            <p className="text-neutral-500">Processing transfer…</p>
          </motion.div>
        )}

        {step === 'input' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pb-8"
          >
            {/* Amount + currency */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                Amount
              </label>
              <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl border border-neutral-100 px-4 py-3">
                <span className="text-2xl font-bold text-neutral-400">{symbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-transparent text-2xl font-bold text-neutral-900 focus:outline-none"
                />
                {/* Currency picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowCurrencies(v => !v)}
                    className="flex items-center gap-1 bg-neutral-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-neutral-700"
                  >
                    {currency} <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {showCurrencies && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-9 bg-white border border-neutral-100 rounded-xl shadow-lg z-10 overflow-hidden"
                      >
                        {CURRENCIES.map(c => (
                          <button
                            key={c}
                            onClick={() => { setCurrency(c); setShowCurrencies(false); }}
                            className={`w-full px-4 py-2.5 text-sm font-medium text-left hover:bg-neutral-50 ${c === currency ? 'text-neutral-900 font-semibold' : 'text-neutral-600'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2 block">
                Recipient
              </label>
              <div className="flex items-center gap-3 bg-neutral-50 rounded-2xl border border-neutral-100 px-4 py-3">
                <User className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  value={recipient}
                  onChange={e => { setRecipient(e.target.value); setRecipientId(e.target.value); }}
                  placeholder="Email or user ID"
                  className="flex-1 bg-transparent text-sm text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Recent contacts */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Recent</p>
              <div className="space-y-2">
                {RECENT_CONTACTS.map((c, i) => (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectContact(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${
                      recipientId === c.id
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-100 bg-neutral-50 text-neutral-900'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      recipientId === c.id ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {c.avatar}
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                    {recipientId === c.id && <Check className="w-4 h-4 ml-auto" />}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleTransfer}
              disabled={!amount || (!recipientId && !recipient)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-neutral-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <span>Send {symbol}{amount || '0.00'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
