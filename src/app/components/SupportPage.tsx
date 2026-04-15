import { motion } from 'motion/react';
import { X, HelpCircle, MessageSquare, ChevronRight, Search, FileText } from 'lucide-react';

interface SupportPageProps {
  onClose: () => void;
}

const FAQ = [
  'When will a bank transfer reach my account?',
  'How can I close my account?',
  "How does Deblock's referral campaign work?",
  "Why don't I see the referral option in my app?",
];

/* ── Overlapping agent avatars ───────────────────────────── */
function AgentAvatars() {
  const avatars = [
    { bg: '#C8A882', initials: '👩' },
    { bg: '#B0D4E8', initials: '🤖' },
    { bg: '#E8A060', initials: '👩‍🦰' },
  ];
  return (
    <div className="flex items-center">
      {avatars.map((a, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-lg overflow-hidden flex-shrink-0"
          style={{
            background: a.bg,
            marginLeft: i === 0 ? 0 : -10,
            zIndex: avatars.length - i,
            position: 'relative',
          }}
        >
          {a.initials}
        </div>
      ))}
    </div>
  );
}

export function SupportPage({ onClose }: SupportPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* Header row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-5 pt-5 pb-2 flex items-center justify-between"
      >
        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-2">
          <AgentAvatars />
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors ml-1"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="px-5 pt-5 pb-6"
      >
        <p className="text-2xl font-bold text-neutral-400 mb-1">
          Hi Zheng <span className="not-italic">👋</span>
        </p>
        <p className="text-2xl font-bold text-neutral-900">How can we help?</p>
      </motion.div>

      {/* Help + Messages card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="mx-4 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mb-3"
      >
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
          <span className="text-base font-semibold text-neutral-900">Help</span>
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        </button>
        <div className="border-t border-neutral-100" />
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
          <span className="text-base font-semibold text-neutral-900">Messages</span>
          <MessageSquare className="w-5 h-5 text-neutral-500" strokeWidth={1.8} />
        </button>
      </motion.div>

      {/* Send us a message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 mb-3"
      >
        <button className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 px-5 py-4 flex items-center justify-between hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
          <span className="text-base font-semibold text-neutral-900">Send us a message</span>
          <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </button>
      </motion.div>

      {/* Search for help */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mx-4 mb-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
            <span className="text-base font-semibold text-neutral-900">Search for help</span>
            <Search className="w-5 h-5 text-neutral-500" strokeWidth={1.8} />
          </div>

          {/* FAQ items */}
          {FAQ.map((q, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors border-b border-neutral-100 last:border-0 text-left"
            >
              <span className="text-sm text-neutral-800 leading-snug pr-4">{q}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" strokeWidth={2} />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
