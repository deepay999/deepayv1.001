import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { CreditCard, Lock, Unlock, Eye, EyeOff, Smartphone, Shield, Zap, Plus, Snowflake, DollarSign, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AppBootstrap, formatDateTimeLabel, getCardStatusLabel, getCardTypeLabel, getTransactionTitle } from '../lib/bootstrap';

interface CardsPageProps {
  bootstrap: AppBootstrap;
}

export function CardsPage({ bootstrap }: CardsPageProps) {
  const { theme } = useTheme();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [frozenCards, setFrozenCards] = useState<Set<string>>(new Set());
  const dragX = useMotionValue(0);

  const cards = (bootstrap.cards.length ? bootstrap.cards : []).map((card, index) => ({
    id: String(card.id),
    type: getCardTypeLabel(card.type),
    name: card.name,
    number: card.maskedNumber,
    fullNumber: card.maskedNumber,
    expiry: card.expiry,
    balance: card.formattedBalance,
    gradient: index % 2 === 0 ? 'from-black via-neutral-900 to-neutral-800' : 'from-neutral-900 via-neutral-800 to-[#0d2a20]',
    brand: card.brand,
    status: card.status,
    statusLabel: getCardStatusLabel(card.status),
  }));

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else if (info.offset.x < -swipeThreshold && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const currentCard = cards[currentCardIndex] ?? null;

  const toggleReveal = (cardId: string) => {
    setRevealedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const toggleFreeze = (cardId: string) => {
    setFrozenCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const isRevealed = currentCard ? revealedCards.has(currentCard.id) : false;
  const isFrozen = currentCard ? frozenCards.has(currentCard.id) : false;

  const cardTransactions = bootstrap.transactions
    .filter((transaction) => transaction.remark === 'virtual_card_add_fund' || transaction.remark === 'withdraw' || transaction.remark === 'add_money')
    .slice(0, 4);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pt-4 pb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold font-['Outfit']">卡片</h1>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center active:bg-neutral-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {cards.length === 0 && (
        <div className="px-5 pb-6">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 text-center">
            <div className="text-lg font-semibold">还没有虚拟卡</div>
            <div className="mt-2 text-sm text-foreground/50">创建第一张 DeePay 卡片后，这里会展示真实卡面与卡片流水。</div>
          </div>
        </div>
      )}

      {/* Card Carousel */}
      {currentCard && (
      <div className="px-5 mb-6 relative" style={{ perspective: 1000 }}>
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="relative"
        >
          <SwipeableCard
            card={currentCard}
            isRevealed={isRevealed}
            isFrozen={isFrozen}
            onToggleReveal={() => toggleReveal(currentCard.id)}
          />
        </motion.div>

        {/* Card indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {cards.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentCardIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentCardIndex ? 'bg-black w-6' : 'bg-neutral-200 w-1.5'
              }`}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
      )}

      {/* Card Actions */}
      {currentCard && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-6"
      >
        <div className="grid grid-cols-4 gap-3">
            {[
            { label: '查看', icon: Eye, action: () => toggleReveal(currentCard.id) },
            { label: '冻结', icon: isFrozen ? Unlock : Snowflake, action: () => toggleFreeze(currentCard.id) },
            { label: currentCard.statusLabel, icon: DollarSign },
            { label: '管理', icon: Settings }
          ].map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-neutral-100 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center">
                <action.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      )}

      {/* Add to Wallet */}
      {currentCard && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-5 mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-black text-white rounded-3xl py-4 px-5 flex items-center justify-center gap-3 font-medium shadow-lg active:bg-neutral-800 transition-colors"
        >
          <Smartphone className="w-5 h-5" />
          <span>添加到电子钱包</span>
        </motion.button>
      </motion.div>
      )}

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-foreground/40 mb-3">交易记录</h3>
          <div className="space-y-3">
            {cardTransactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-3.5 flex items-center justify-between border border-neutral-100 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-lg">
                    {tx.type === 'credit' ? '↗' : '↘'}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{getTransactionTitle(tx)}</div>
                    <div className="text-xs text-foreground/40">{formatDateTimeLabel(tx.createdAt)}</div>
                  </div>
                </div>
                <div className={`font-['Outfit'] font-semibold text-sm ${
                  tx.type === 'credit'
                    ? 'text-green-500'
                    : 'text-foreground/60'
                }`}>
                  {tx.formattedAmount}
                </div>
              </motion.div>
            ))}

            {cardTransactions.length === 0 && (
              <div className="rounded-2xl border border-neutral-100 bg-white/60 p-4 text-sm text-foreground/50">
                当前还没有与卡片相关的真实流水记录。
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SwipeableCard({
  card,
  isRevealed,
  isFrozen,
  onToggleReveal
}: {
  card: {
    id: string;
    type: string;
    name: string;
    number: string;
    fullNumber: string;
    expiry: string;
    balance: string;
    gradient: string;
    brand: string;
    statusLabel: string;
  };
  isRevealed: boolean;
  isFrozen: boolean;
  onToggleReveal: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div
        className={`bg-gradient-to-br ${card.gradient} text-white rounded-3xl p-6 shadow-lg relative overflow-hidden aspect-[1.6/1] ${
          isFrozen ? 'opacity-60' : ''
        }`}
      >
        {/* Frozen overlay */}
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20"
          >
            <div className="text-center">
              <Lock className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm font-semibold">卡片已冻结</span>
            </div>
          </motion.div>
        )}

        {/* Logo top left */}
        <div className="absolute top-6 left-6">
          <div className="text-lg font-bold">DeePay</div>
        </div>

        {/* Brand logo top right */}
        <div className="absolute top-6 right-6">
          <div className="text-2xl font-bold opacity-80">{card.brand}</div>
        </div>

        {/* Card Number */}
        <div className="absolute bottom-20 left-6 right-6">
          <div className="font-['Outfit'] text-xl tracking-wider font-semibold">
            {isRevealed ? card.fullNumber : card.number}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div>
            <div className="text-xs opacity-70 mb-1">{card.type}</div>
            <div className="text-sm font-semibold">{card.name}</div>
            <div className="text-xs opacity-70 mt-1">{card.balance}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-70 mb-1">到期</div>
            <div className="text-sm font-semibold">{card.expiry}</div>
            <div className="text-xs opacity-70 mt-1">{card.statusLabel}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
