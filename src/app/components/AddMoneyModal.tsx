import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Building2, Smartphone, Check } from 'lucide-react';
import { useState } from 'react';
import { api } from '../services/api';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMoneyModal({ isOpen, onClose }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | 'apple' | null>(null);
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input');
  const [paymentLink, setPaymentLink] = useState('');

  const methods = [
    { id: 'card' as const, name: 'Debit Card', icon: CreditCard, subtitle: 'Instant' },
    { id: 'bank' as const, name: 'Bank Transfer', icon: Building2, subtitle: '1-2 days' },
    { id: 'apple' as const, name: 'Apple Pay', icon: Smartphone, subtitle: 'Instant' }
  ];

  const savedCards = [
    { last4: '4532', brand: 'Visa', expiry: '12/28' },
    { last4: '5412', brand: 'Mastercard', expiry: '09/27' }
  ];

  const reset = () => {
    onClose();
    setStep('input');
    setAmount('');
    setMethod(null);
    setPaymentLink('');
  };

  const handleAddMoney = async () => {
    if (!amount || !method) return;
    setStep('processing');
    try {
      if (method === 'bank') {
        // Bank transfer: show IBAN instructions — no API call needed
        setStep('success');
      } else {
        // Card / Apple Pay: create a hosted payment request via the API
        const res = await api.createPayment({
          amount: parseFloat(amount),
          currency: 'EUR',
        });
        if (res.payment_link) {
          setPaymentLink(res.payment_link);
        }
        setStep('success');
      }
    } catch (err) {
      console.error('[AddMoneyModal] createPayment failed:', err);
      setStep('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          >
            {/* Expanding rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 2 + i, opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.15 }}
                className="absolute inset-0 border-2 border-white/20 rounded-full"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {step === 'success' ? (
              <div className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6"
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold mb-2"
                >
                  {method === 'bank' ? 'Details Ready!' : 'Request Created!'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-center mb-4"
                >
                  {method === 'bank'
                    ? `Transfer €${amount} to your IBAN from your bank to top up your account.`
                    : `Your payment request for €${amount} has been created.`}
                </motion.p>
                {paymentLink && (
                  <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Open payment page
                  </motion.a>
                )}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={reset}
                  className="mt-3 text-sm text-muted-foreground underline"
                >
                  Close
                </motion.button>
              </div>
            ) : step === 'error' ? (
              <div className="p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
                <p className="text-muted-foreground text-center mb-8">Something went wrong. Please try again.</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('input')}
                  className="px-6 py-3 rounded-2xl bg-neutral-900 text-white text-sm font-semibold"
                >
                  Try Again
                </motion.button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold font-['Outfit']">Add Money</h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[500px] overflow-y-auto">
                  {step === 'input' && (
                    <>
                      {/* Amount Input */}
                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-['Outfit'] font-bold">€</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-secondary rounded-2xl py-4 pl-12 pr-4 text-2xl font-['Outfit'] font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        {/* Quick amounts */}
                        <div className="flex gap-2 mt-3">
                          {[50, 100, 200, 500].map((value) => (
                            <motion.button
                              key={value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setAmount(value.toString())}
                              className="flex-1 bg-secondary hover:bg-accent rounded-xl py-2 text-sm font-medium transition-colors"
                            >
                              €{value}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-3 block">Payment Method</label>
                        <div className="space-y-2">
                          {methods.map((m, i) => (
                            <motion.button
                              key={m.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setMethod(m.id)}
                              className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${
                                method === m.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary hover:bg-accent'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                method === m.id ? 'bg-white/20' : 'bg-accent'
                              }`}>
                                <m.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium">{m.name}</div>
                                <div className={`text-xs ${
                                  method === m.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {m.subtitle}
                                </div>
                              </div>
                              {method === m.id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Saved Cards (if card method selected) */}
                      {method === 'card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-6"
                        >
                          <label className="text-sm text-muted-foreground mb-3 block">Select Card</label>
                          <div className="space-y-2">
                            {savedCards.map((card, i) => (
                              <motion.button
                                key={card.last4}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-secondary hover:bg-accent rounded-xl p-3 flex items-center gap-3 transition-colors"
                              >
                                <CreditCard className="w-5 h-5" />
                                <div className="flex-1 text-left">
                                  <div className="text-sm font-medium">{card.brand} •••• {card.last4}</div>
                                  <div className="text-xs text-muted-foreground">Expires {card.expiry}</div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <motion.div
                        className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <p className="mt-4 text-muted-foreground">Processing payment...</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {step === 'input' && (
                  <div className="p-6 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddMoney}
                      disabled={!amount || !method}
                      className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add €{amount || '0.00'}
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
