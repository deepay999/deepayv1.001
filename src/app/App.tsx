import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Wallet, ArrowLeftRight, Building2, Activity, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HomePage } from './components/HomePage';
import { WalletsPage } from './components/WalletsPage';
import { TransferPage } from './components/TransferPage';
import { IBANPage } from './components/IBANPage';
import { ActivityPage } from './components/ActivityPage';
import { ProfilePage } from './components/ProfilePage';
import { PointsPage } from './components/PointsPage';
import { AddMoneyModal } from './components/AddMoneyModal';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { ThemeProvider } from './contexts/ThemeContext';

/* ─── nav tab definition ──────────────────────────────────── */
const TABS = [
  { id: 'home',     icon: Home,           labelKey: 'tab.home'     },
  { id: 'wallet',   icon: Wallet,         labelKey: 'tab.wallet'   },
  { id: 'transfer', icon: ArrowLeftRight, labelKey: 'tab.transfer' },
  { id: 'iban',     icon: Building2,      labelKey: 'tab.iban'     },
  { id: 'activity', icon: Activity,       labelKey: 'tab.activity' },
  { id: 'points',   icon: Star,           labelKey: 'tab.points'   },
];

/* ─── App ─────────────────────────────────────────────────── */
export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab]            = useState('home');
  const [showAddMoneyModal, setAddMoneyModal] = useState(false);
  const [showSplash, setShowSplash]           = useState(true);
  const [showProfile, setShowProfile]         = useState(false);

  const renderPage = () => {
    if (showProfile) return <ProfilePage onBack={() => setShowProfile(false)} onViewWebsite={() => {}} />;
    switch (activeTab) {
      case 'home':     return <HomePage onAddMoney={() => setAddMoneyModal(true)} onTransfer={() => setActiveTab('transfer')} onOpenProfile={() => setShowProfile(true)} />;
      case 'wallet':   return <WalletsPage />;
      case 'transfer': return <TransferPage />;
      case 'iban':     return <IBANPage />;
      case 'activity': return <ActivityPage />;
      case 'points':   return <PointsPage />;
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
            <PageSwipeTransition key={showProfile ? 'profile' : activeTab}>
              {renderPage()}
            </PageSwipeTransition>
          </AnimatePresence>
        </div>

        {/* ── Bottom Navigation ── */}
        <AnimatePresence>
          {!showProfile && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
                      className="flex flex-col items-center gap-1 px-2 py-1 relative"
                    >
                      {/* Pill background for active tab */}
                      {isActive && (
                        <motion.div
                          layoutId="navPill"
                          className="absolute inset-x-0 top-0 h-8 rounded-2xl bg-neutral-100"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <tab.icon
                        className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                          isActive ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      <span className={`text-[10px] font-medium relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-neutral-900' : 'text-neutral-400'
                      }`}>
                        {t(tab.labelKey)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setAddMoneyModal(false)} />
    </ThemeProvider>
  );
}
