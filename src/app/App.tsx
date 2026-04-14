import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wallet, ArrowUpRight, Building2, BarChart2, User } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { WalletPage } from './components/WalletPage';
import { TransferPage } from './components/TransferPage';
import { IBANPage } from './components/IBANPage';
import { ActivityPage } from './components/ActivityPage';
import { ProfilePage } from './components/ProfilePage';
import { TransferModal } from './components/TransferModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

/* ─── nav tab definition ──────────────────────────────────── */
const TABS = [
  { id: 'home',     icon: Home,        label: 'Home'       },
  { id: 'wallet',   icon: Wallet,      label: 'Wallet'     },
  { id: 'transfer', icon: ArrowUpRight, label: 'Transfer'  },
  { id: 'iban',     icon: Building2,   label: 'IBAN'       },
  { id: 'activity', icon: BarChart2,   label: 'Activity'   },
  { id: 'profile',  icon: User,        label: 'Profile'    },
];

/* ─── App ─────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab]             = useState('home');
  const [showTransferModal, setTransferModal]  = useState(false);
  const [showAddMoneyModal, setAddMoneyModal]  = useState(false);
  const [showSplash, setShowSplash]            = useState(true);

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onAddMoney={() => setAddMoneyModal(true)}
            onTransfer={() => setActiveTab('transfer')}
            onWithdraw={() => {}}
            onOpenProfile={() => setActiveTab('profile')}
          />
        );
      case 'wallet':   return <WalletPage />;
      case 'transfer': return <TransferPage />;
      case 'iban':     return <IBANPage />;
      case 'activity': return <ActivityPage />;
      case 'profile':  return <ProfilePage onBack={() => setActiveTab('home')} />;
      default:         return null;
    }
  };

  return (
    <ThemeProvider>
      {/* Splash */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {/* Full-screen app wrapper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 0.4 }}
        className="fixed inset-0 flex flex-col bg-white overflow-hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Page content (takes remaining height above nav) */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <PageSwipeTransition key={activeTab}>
              {renderPage()}
            </PageSwipeTransition>
          </AnimatePresence>
        </div>

        {/* ── Bottom Navigation ── */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.3 }}
          className="flex-shrink-0 border-t border-neutral-100 bg-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around px-1 h-16">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 relative flex-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-x-1 top-0 h-8 rounded-2xl bg-neutral-100"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                      isActive ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className={`text-[9px] font-medium relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-neutral-900' : 'text-neutral-400'
                  }`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      </motion.div>

      {/* Modals */}
      <TransferModal isOpen={showTransferModal} onClose={() => setTransferModal(false)} />
      <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setAddMoneyModal(false)} />
    </ThemeProvider>
  );
}
