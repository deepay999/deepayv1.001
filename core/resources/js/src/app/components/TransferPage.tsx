import { motion } from 'framer-motion';
import { ArrowRight, Users, HelpCircle, ScanLine, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { AppBootstrap } from '../lib/bootstrap';

interface TransferPageProps {
  bootstrap: AppBootstrap;
  onQuickTransfer: () => void;
}

export function TransferPage({ bootstrap, onQuickTransfer }: TransferPageProps) {
  const [fromAmount, setFromAmount] = useState('1,000');
  const [toAmount, setToAmount] = useState('944.87');
  const [fromCurrency, setFromCurrency] = useState(bootstrap.currency.code);
  const [toCurrency, setToCurrency] = useState(bootstrap.currency.code);
  const exchangeRate = 0.9893;
  const fee = 45.00;

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-5 flex items-center justify-between mb-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-11 h-11 rounded-full bg-neutral-200/80 flex items-center justify-center hover:bg-neutral-300/80 active:bg-neutral-400/80 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-neutral-300/80" />
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          >
            <ScanLine className="w-5 h-5 text-foreground/70" strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-foreground/70" strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* Transfer Type Buttons */}
      <div className="px-5 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-neutral-100/80 rounded-[28px] py-5 px-5 flex items-center justify-between hover:bg-neutral-200/80 active:bg-neutral-300/80 transition-colors"
          >
            <span className="text-base font-medium">全球转账</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-neutral-100/80 rounded-[28px] py-5 px-5 flex items-center justify-between hover:bg-neutral-200/80 active:bg-neutral-300/80 transition-colors"
          >
            <span className="text-base font-medium">内部转账</span>
            <Users className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="px-5">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium mb-5 text-foreground/90"
        >
          计算器
        </motion.h2>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-100/50 rounded-[32px] p-6"
        >
          {/* From Currency */}
          <div className="mb-2">
            <div className="bg-white rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{bootstrap.currency.symbol}</span>
                </div>
                <span className="font-medium text-base">{fromCurrency}</span>
                <ChevronDown className="w-4 h-4 ml-auto text-foreground/40" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-5xl font-['Outfit'] font-light text-neutral-300 outline-none text-right tracking-tight"
                style={{ letterSpacing: '-0.02em' }}
              />
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="flex items-center justify-center gap-2 my-4 text-sm text-foreground/50">
            <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="font-medium">1 {fromCurrency} = {exchangeRate} {toCurrency}</span>
          </div>

          {/* To Currency */}
          <div className="mb-5">
            <div className="bg-white rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 border-2 border-neutral-200">
                  <span className="text-foreground font-bold text-sm">{bootstrap.currency.symbol}</span>
                </div>
                <span className="font-medium text-base">{toCurrency}</span>
                <ChevronDown className="w-4 h-4 ml-auto text-foreground/40" strokeWidth={2.5} />
              </div>
              <div className="w-full text-5xl font-['Outfit'] font-light text-neutral-300 text-right tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                {toAmount}
              </div>
            </div>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between mb-6 px-1">
            <span className="text-sm text-foreground/50">含手续费</span>
            <span className="text-sm font-medium text-foreground/70">{fee.toFixed(2)} USDT</span>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onQuickTransfer}
            className="w-full bg-black text-white rounded-[20px] py-4 text-base font-medium shadow-sm active:bg-neutral-800 transition-colors"
          >
            继续
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
