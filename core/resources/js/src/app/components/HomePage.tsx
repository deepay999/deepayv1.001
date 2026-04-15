import { motion } from 'framer-motion';
import { Home, TrendingUp, Search, ArrowUpRight, ArrowDownLeft, Percent, Gift, Repeat } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AppBootstrap, formatDateLabel, getTransactionSubtitle, getTransactionTitle } from '../lib/bootstrap';

interface HomePageProps {
  bootstrap: AppBootstrap;
  onAddMoney: () => void;
  onTransfer: () => void;
  onOpenProfile: () => void;
}

export function HomePage({ bootstrap, onAddMoney, onTransfer, onOpenProfile }: HomePageProps) {
  const { theme } = useTheme();
  const transactions = bootstrap.transactions.slice(0, 3).map((transaction) => {
    const icon = transaction.type === 'credit'
      ? Percent
      : transaction.remark === 'virtual_card_add_fund'
      ? Repeat
      : ArrowUpRight;

    const type = transaction.type === 'credit'
      ? 'income'
      : transaction.remark === 'virtual_card_add_fund'
      ? 'exchange'
      : 'expense';

    return {
      id: transaction.id,
      date: formatDateLabel(transaction.createdAt),
      title: getTransactionTitle(transaction),
      subtitle: getTransactionSubtitle(transaction),
      time: transaction.createdAt
        ? new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(transaction.createdAt))
        : '刚刚',
      amount: transaction.formattedAmount,
      icon,
      type,
    };
  });

  const accountLabel = bootstrap.isDemo
    ? '演示账户'
    : bootstrap.user.countryName || '已认证账户';

  return (
    <div className="h-full overflow-y-auto px-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenProfile}
          className="w-11 h-11 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden hover:bg-neutral-300 active:bg-neutral-400 transition-colors"
        >
          <span className="text-foreground font-medium text-sm">{bootstrap.user.initials}</span>
        </motion.button>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 transition-colors hover:bg-green-100 active:bg-green-200"
          >
              <div className="relative h-3.5 w-3.5">
                <div className="absolute inset-0 rounded-full bg-green-500 blur-sm opacity-70" />
                <div className="relative h-3.5 w-3.5 rounded-full bg-green-500" />
              </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          >
            <Search className="w-5 h-5 text-foreground/60" strokeWidth={2} />
          </motion.button>
        </div>
      </motion.div>

      {/* Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-4xl font-['Outfit'] font-semibold tracking-tight text-foreground">
            {bootstrap.user.formattedBalance}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/60">{bootstrap.currency.code}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-foreground/40">
              <path d="M3 6L6 9L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-foreground/50">
            <Home className="w-4 h-4" strokeWidth={2} />
            <span>{accountLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <ArrowUpRight className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} />
            <span className="font-semibold text-green-500">{bootstrap.metrics.activeCardCount} 张卡已激活</span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddMoney}
          className="bg-black text-white rounded-2xl py-3.5 px-5 flex items-center justify-center gap-2 font-medium active:bg-neutral-800 transition-colors"
        >
          <ArrowDownLeft className="w-5 h-5" strokeWidth={2} />
          <span>Add Money</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onTransfer}
          className="bg-white border border-neutral-200 text-foreground rounded-2xl py-3.5 px-5 flex items-center justify-center gap-2 font-medium hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
        >
          <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
          <span>Transfer</span>
        </motion.button>
      </motion.div>

      {/* Referral Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-neutral-100"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
                <h3 className="font-semibold text-sm mb-0.5">邀请激励</h3>
              <p className="text-xs text-foreground/50 leading-relaxed">
                  完成 DeePay 邀请后，可在账户体系内持续获得返佣与活动奖励。
              </p>
            </div>
          </div>
          <button className="text-foreground/30 hover:text-foreground/60 transition-colors text-lg leading-none">
            ✕
          </button>
        </div>
      </motion.div>

      {/* Transactions */}
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <div className="text-xs font-medium mb-2 text-foreground/40">
              {transaction.date}
            </div>
            <motion.div
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-3.5 flex items-center justify-between border border-neutral-100 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  transaction.type === 'income'
                    ? 'bg-black text-white'
                    : transaction.type === 'exchange'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-foreground'
                }`}>
                  <transaction.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-medium text-sm">{transaction.title}</div>
                  <div className="text-xs text-foreground/40">{transaction.time}</div>
                  {transaction.subtitle && (
                    <div className="text-xs text-foreground/40">{transaction.subtitle}</div>
                  )}
                </div>
              </div>
              <div className={`font-['Outfit'] font-semibold text-sm ${
                transaction.amount.startsWith('+')
                  ? 'text-foreground'
                  : transaction.amount.startsWith('-')
                  ? 'text-foreground/60'
                  : 'text-foreground'
              }`}>
                {transaction.amount}
              </div>
            </motion.div>
          </motion.div>
        ))}

        {transactions.length === 0 && (
          <div className="rounded-2xl border border-neutral-100 bg-white/60 p-4 text-sm text-foreground/50">
            暂无账户流水，完成首次入金后这里会显示真实交易记录。
          </div>
        )}
      </div>
    </div>
  );
}
