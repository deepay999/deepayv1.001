import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Building2, Smartphone, Check } from 'lucide-react';
import { useState } from 'react';
import { AppBootstrap } from '../lib/bootstrap';

interface AddMoneyModalProps {
  bootstrap: AppBootstrap;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMoneyModal({ bootstrap, isOpen, onClose }: AddMoneyModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank' | 'apple' | null>(null);
  const [step, setStep] = useState<'input' | 'redirect'>('input');

  const methods = [
    { id: 'card' as const, name: '银行卡', icon: CreditCard, subtitle: '实时入金' },
    { id: 'bank' as const, name: '银行转账', icon: Building2, subtitle: '1-2 个工作日' },
    { id: 'apple' as const, name: 'Apple Pay', icon: Smartphone, subtitle: '实时入金' }
  ];

  const savedCards = [
    { last4: '4532', brand: 'Visa', expiry: '12/28' },
    { last4: '5412', brand: 'Mastercard', expiry: '09/27' }
  ];

  const handleAddMoney = () => {
    setStep('redirect');

    if (typeof window !== 'undefined') {
      window.location.href = '/deposit';
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
            {step === 'redirect' ? (
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
                  正在进入入金流程
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-center"
                >
                  DeePay 将跳转到正式入金页面，继续使用真实支付网关与审核流程。
                </motion.p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold font-['Outfit']">添加资金</h2>
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
                        <label className="text-sm text-muted-foreground mb-2 block">金额</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-['Outfit'] font-bold">{bootstrap.currency.symbol}</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-secondary rounded-2xl py-4 pl-12 pr-4 text-2xl font-['Outfit'] font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          当前账户余额：{bootstrap.user.formattedBalance}
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
                        <label className="text-sm text-muted-foreground mb-3 block">入金方式</label>
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
                          <label className="text-sm text-muted-foreground mb-3 block">选择已保存卡片</label>
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
                      继续前往正式入金
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
