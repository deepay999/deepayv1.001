import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, User, CreditCard, Check } from 'lucide-react';
import { useState } from 'react';
import { AppBootstrap } from '../lib/bootstrap';

interface TransferModalProps {
  bootstrap: AppBootstrap;
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ bootstrap, isOpen, onClose }: TransferModalProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [step, setStep] = useState<'input' | 'redirect'>('input');

  const recentContacts = [
    { name: '财务团队', avatar: 'FT', email: 'finance@deepay.local' },
    { name: '运营结算', avatar: 'OP', email: 'ops@deepay.local' },
    { name: '商务收款', avatar: 'BD', email: 'biz@deepay.local' }
  ];

  const handleTransfer = () => {
    setStep('redirect');

    if (typeof window !== 'undefined') {
      window.location.href = '/send-money';
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
            {/* Ripple effect on backdrop */}
            <motion.div
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </motion.div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -90 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
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
                  正在进入转账流程
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-center"
                >
                  DeePay 将跳转到正式转账页面，使用真实账户余额与风控规则继续处理。
                </motion.p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h2 className="text-xl font-bold font-['Outfit']">发起转账</h2>
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
                      </div>

                      {/* Recipient Input */}
                      <div className="mb-6">
                        <label className="text-sm text-muted-foreground mb-2 block">收款对象</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="姓名、邮箱或账户标识"
                            className="w-full bg-secondary rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          当前可用余额：{bootstrap.user.formattedBalance}
                        </div>
                      </div>

                      {/* Recent Contacts */}
                      <div>
                        <h3 className="text-sm font-semibold mb-3">最近常用</h3>
                        <div className="space-y-2">
                          {recentContacts.map((contact, i) => (
                            <motion.button
                              key={contact.email}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setRecipient(contact.name)}
                              className="w-full bg-secondary hover:bg-accent rounded-xl p-3 flex items-center gap-3 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-black to-neutral-700 flex items-center justify-center text-white font-semibold text-sm">
                                {contact.avatar}
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-sm">{contact.name}</div>
                                <div className="text-xs text-muted-foreground">{contact.email}</div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  
                </div>

                {/* Footer */}
                {step === 'input' && (
                  <div className="p-6 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTransfer}
                      disabled={!amount || !recipient}
                      className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>继续前往正式转账</span>
                      <ArrowRight className="w-5 h-5" />
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
