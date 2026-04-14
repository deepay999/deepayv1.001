import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

const CURRENCIES = ['EUR', 'USD', 'GBP'];

type SendState = 'idle' | 'sending' | 'success' | 'error';

export function TransferPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [currency, setCurrency]   = useState('EUR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [state, setState]         = useState<SendState>('idle');

  const isValid = recipient.trim().length > 0 && parseFloat(amount) > 0;

  const handleSend = () => {
    if (!isValid) return;
    setState('sending');
    setTimeout(() => setState('success'), 1500);
  };

  const handleReset = () => {
    setRecipient('');
    setAmount('');
    setState('idle');
  };

  const symbolOf: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Invia denaro</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Trasferisci fondi a un altro utente DeePay</p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-6 rounded-2xl bg-emerald-50 p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-bold text-neutral-900 mb-1">Trasferimento inviato!</p>
            <p className="text-sm text-neutral-500 mb-6">
              {symbolOf[currency]}{parseFloat(amount || '0').toLocaleString('en-EU', { minimumFractionDigits: 2 })} {currency} → {recipient}
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
            >
              Nuovo trasferimento
            </motion.button>
          </motion.div>
        ) : (
          /* ── Form ── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 space-y-3"
          >
            {/* To field */}
            <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
              <label className="block px-4 pt-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                Destinatario
              </label>
              <input
                type="text"
                placeholder="Email o ID utente"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full px-4 pb-3 pt-1 text-sm text-neutral-900 placeholder-neutral-300 bg-transparent outline-none"
              />
            </div>

            {/* Amount + Currency row */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                <label className="block px-4 pt-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                  Importo
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 pb-3 pt-1 text-sm text-neutral-900 placeholder-neutral-300 bg-transparent outline-none"
                />
              </div>

              {/* Currency picker */}
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyPicker(v => !v)}
                  className="h-full min-w-[80px] flex items-center justify-between gap-1 px-4 rounded-2xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-800"
                >
                  {currency}
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${showCurrencyPicker ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showCurrencyPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 right-0 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 overflow-hidden"
                    >
                      {CURRENCIES.map(c => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setShowCurrencyPicker(false); }}
                          className={`block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors ${c === currency ? 'text-neutral-900 bg-neutral-50' : 'text-neutral-600'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fee note */}
            <p className="text-xs text-neutral-400 px-1">
              Trasferimenti interni DeePay: <span className="font-semibold text-emerald-600">gratuiti</span> e istantanei.
            </p>

            {/* Send button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={!isValid || state === 'sending'}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-colors mt-2 ${
                isValid
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
              }`}
            >
              {state === 'sending' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Invia
                </>
              )}
            </motion.button>

            {state === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Trasferimento fallito. Riprova.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
