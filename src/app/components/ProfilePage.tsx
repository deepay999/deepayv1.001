import { motion } from 'motion/react';
import { ArrowLeft, Headphones, Settings, Copy, Lock, CircleDollarSign, MessageCircle, Share2, Info, ChevronRight, Globe } from 'lucide-react';
import { LanguageDropdown } from './LanguageDropdown';

interface ProfilePageProps {
  onBack: () => void;
  onViewWebsite?: () => void;
}

export function ProfilePage({ onBack, onViewWebsite }: ProfilePageProps) {
  return (
    <div className="h-full overflow-y-auto bg-background pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-5 flex items-center justify-between mb-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <div className="flex items-center gap-3">
          <LanguageDropdown theme="light" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          >
            <Headphones className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          >
            <Settings className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-5 mb-6"
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              <span className="text-foreground font-semibold text-xl">U</span>
            </div>
            {/* Country flag badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center">
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <rect width="20" height="14" fill="#009246"/>
                <rect x="6.67" width="6.66" height="14" fill="#F1F2F1"/>
                <rect x="13.33" width="6.67" height="14" fill="#CE2B37"/>
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">med****@gmail.com</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground/60">UID: 1874957242</span>
              <button className="p-1 hover:bg-neutral-100 rounded transition-colors">
                <Copy className="w-3.5 h-3.5 text-foreground/60" strokeWidth={2.5} />
              </button>
            </div>
            <div className="inline-block bg-neutral-200 text-foreground px-3 py-1 rounded-md text-xs font-medium">
              审核通过
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="mt-2"
          >
            <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* Referral Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-5 mb-8"
      >
        <div className="bg-neutral-100/80 rounded-[24px] p-5 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-800 to-black flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" stroke="white" strokeWidth="2" />
              <circle cx="15" cy="11" r="3" stroke="white" strokeWidth="2" />
              <path d="M5 19c0-2.5 2-4 4-4s4 1.5 4 4M11 19c0-2.5 2-4 4-4s4 1.5 4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">推荐</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              通过邀请朋友赚取高达 40% 的佣金
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex-shrink-0"
          >
            立即邀请
          </motion.button>
        </div>
      </motion.div>

      {/* Menu Items */}
      <div className="px-5 space-y-1">
        {/* Security */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Lock className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-base font-medium">安全</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-neutral-800 rounded-full"></div>
              <div className="w-1 h-4 bg-neutral-800 rounded-full"></div>
              <div className="w-1 h-4 bg-neutral-800 rounded-full"></div>
              <div className="w-1 h-4 bg-neutral-200 rounded-full"></div>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
          </div>
        </motion.button>

        {/* Payment Settings */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <CircleDollarSign className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-base font-medium">支付设置</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
        </motion.button>

        {/* Community */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-base font-medium">社区</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
        </motion.button>

        {/* Share */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Share2 className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-base font-medium">分享</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
        </motion.button>

        {/* Website */}
        {onViewWebsite && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.475 }}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewWebsite}
            className="w-full flex items-center justify-between py-4 border-b border-neutral-100 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5" strokeWidth={2.5} />
              <span className="text-base font-medium">官网</span>
            </div>
            <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
          </motion.button>
        )}

        {/* About Us */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-between py-4 hover:bg-neutral-50 -mx-6 px-5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Info className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-base font-medium">关于我们</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground/40">V3.3.0</span>
            <ChevronRight className="w-5 h-5 text-foreground/40" strokeWidth={2.5} />
          </div>
        </motion.button>
      </div>
    </div>
  );
}
