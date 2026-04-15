import { motion } from 'framer-motion';
import { ArrowUpRight, CreditCard, Landmark, Plus, ShieldCheck, WalletCards } from 'lucide-react';
import { AppBootstrap, formatDateTimeLabel, getTransactionTitle } from '../lib/bootstrap';

interface VaultsPageProps {
  bootstrap: AppBootstrap;
}

export function VaultsPage({ bootstrap }: VaultsPageProps) {
  const summaryCards = [
    {
      label: '可用余额',
      value: bootstrap.user.formattedBalance,
      helper: bootstrap.currency.code,
      icon: Landmark,
    },
    {
      label: '卡片沉淀',
      value: bootstrap.metrics.formattedTotalCardBalance,
      helper: `${bootstrap.metrics.activeCardCount} 张活跃卡`,
      icon: CreditCard,
    },
    {
      label: '流水总数',
      value: String(bootstrap.metrics.transactionCount),
      helper: `${bootstrap.metrics.topUpCount} 次入金`,
      icon: WalletCards,
    },
  ];

  const recentTransactions = bootstrap.transactions.slice(0, 5);

  return (
    <div className="h-full overflow-y-auto px-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold font-['Outfit']">钱包</h1>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center active:bg-neutral-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-sm text-foreground/50">总览你的真实账户资金、卡片占用和最新资金动作。</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-[2rem] border border-neutral-100 bg-black p-6 text-white"
      >
        <div className="flex items-center gap-2 text-white/65">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm">DeePay 资金总览</span>
        </div>
        <div className="mt-4 text-4xl font-['Outfit'] font-semibold tracking-tight">{bootstrap.user.formattedBalance}</div>
        <div className="mt-2 text-sm text-white/55">
          {bootstrap.user.countryName || '全球账户'} · {bootstrap.user.mobileNumber || '未绑定手机号'}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">站内资产</div>
            <div className="mt-2 text-lg font-semibold">{bootstrap.user.formattedBalance}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">卡片余额</div>
            <div className="mt-2 text-lg font-semibold">{bootstrap.metrics.formattedTotalCardBalance}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {summaryCards.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="rounded-2xl border border-neutral-100 bg-white p-4"
          >
            <item.icon className="w-5 h-5 text-foreground/55" strokeWidth={2} />
            <div className="mt-3 text-lg font-semibold font-['Outfit']">{item.value}</div>
            <div className="mt-1 text-xs text-foreground/45">{item.label}</div>
            <div className="mt-2 text-xs text-foreground/35">{item.helper}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-[2rem] border border-neutral-100 bg-white p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground/40">最近资金动作</h3>
          <span className="text-xs text-foreground/35">{bootstrap.metrics.transactionCount} 笔累计</span>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.04 }}
              className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                  <ArrowUpRight className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-sm font-medium">{getTransactionTitle(transaction)}</div>
                  <div className="text-xs text-foreground/45">{formatDateTimeLabel(transaction.createdAt)}</div>
                </div>
              </div>
              <div className={`text-sm font-semibold font-['Outfit'] ${transaction.type === 'credit' ? 'text-green-600' : 'text-foreground/65'}`}>
                {transaction.formattedAmount}
              </div>
            </motion.div>
          ))}

          {recentTransactions.length === 0 && (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 text-sm text-foreground/45">
              账户还没有可展示的真实资金动作。
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
