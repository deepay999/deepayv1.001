import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, KeyRound, Fingerprint, LogOut, FileText, ChevronRight } from 'lucide-react';

interface PrivacySecurityPageProps {
  onBack: () => void;
}

export function PrivacySecurityPage({ onBack }: PrivacySecurityPageProps) {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  return (
    <div className="h-full overflow-y-auto bg-[#f2f2f7]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 py-5 flex items-center gap-4 mb-2"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
        <h1 className="text-xl font-semibold">Privacy &amp; security</h1>
      </motion.div>

      {/* Security section */}
      <div className="px-5 mb-4">
        <p className="text-sm font-medium text-neutral-500 mb-2 px-1">Security</p>

        {/* Change Passcode */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl flex items-center justify-between px-4 py-4 mb-3 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <KeyRound className="w-5 h-5" strokeWidth={2} />
            <span className="text-base font-medium">Change Passcode</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" strokeWidth={2} />
        </motion.button>

        {/* Biometrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full bg-white rounded-2xl flex items-center justify-between px-4 py-4 mb-3 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <Fingerprint className="w-5 h-5" strokeWidth={2} />
            <span className="text-base font-medium">Biometrics</span>
          </div>
          <button
            onClick={() => setBiometricsEnabled(v => !v)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              biometricsEnabled ? 'bg-emerald-400' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                biometricsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl flex items-center justify-between px-4 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="text-base font-medium">Logout</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" strokeWidth={2} />
        </motion.button>
      </div>

      {/* Privacy section */}
      <div className="px-5 mb-4">
        <p className="text-sm font-medium text-neutral-500 mb-2 px-1">Privacy</p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl flex items-center justify-between px-4 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5" strokeWidth={2} />
            <span className="text-base font-medium">Privacy policy</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" strokeWidth={2} />
        </motion.button>
      </div>

      {/* Yield section */}
      <div className="px-5 mb-4">
        <p className="text-sm font-medium text-neutral-500 mb-2 px-1">Yield</p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white rounded-2xl flex items-center justify-between px-4 py-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M6.5 17.5a8 8 0 0 1 0-11" />
              <path d="M17.5 6.5a8 8 0 0 1 0 11" />
              <path d="M4 20l2-2" />
              <path d="M18 6l2-2" />
            </svg>
            <span className="text-base font-medium">Opt out of auto-yield</span>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400" strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
