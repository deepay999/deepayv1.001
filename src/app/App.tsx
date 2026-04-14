import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, CreditCard, Wallet, Send, QrCode } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { TransferPage } from './components/TransferPage';
import { CardsPage } from './components/CardsPage';
import { VaultsPage } from './components/VaultsPage';
import { ProfilePage } from './components/ProfilePage';
import { QRCodePage } from './components/QRCodePage';
import { TransferModal } from './components/TransferModal';
import { AddMoneyModal } from './components/AddMoneyModal';
import { ParticlesBackground } from './components/ParticlesBackground';
import { SplashScreen } from './components/SplashScreen';
import { PageSwipeTransition } from './components/PageTransition';
import { OrbitalLoader } from './components/LoadingIndicator';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleTabChange = (tabId: string) => {
    setIsChangingPage(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsChangingPage(false);
    }, 150);
  };

  const renderPage = () => {
    if (showProfile) {
      return <ProfilePage onBack={() => setShowProfile(false)} onViewWebsite={() => {}} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onAddMoney={() => setShowAddMoneyModal(true)}
            onTransfer={() => setShowTransferModal(true)}
            onOpenProfile={() => setShowProfile(true)}
          />
        );
      case 'transfer':
        return <TransferPage onQuickTransfer={() => setShowTransferModal(true)} />;
      case 'cards':
        return <CardsPage />;
      case 'wallet':
        return <VaultsPage />;
      case 'qr':
        return <QRCodePage />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden"
      >
        <ParticlesBackground />

        {/* Mobile Banking App Container - Enterprise Grade */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 3, type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-[390px] h-[844px] rounded-[3rem] overflow-hidden relative z-10"
          style={{
            background: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
            boxShadow: `
              0 50px 100px -20px rgba(0, 0, 0, 0.25),
              0 30px 60px -30px rgba(0, 0, 0, 0.3),
              inset 0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.8)
            `,
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Status Bar - Premium */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.3 }}
            className="h-12 flex items-center justify-between px-8 pt-3"
          >
            <span className="text-xs font-medium opacity-50 tracking-wide">
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2">
              {/* Signal */}
              <svg width="18" height="12" viewBox="0 0 18 12" className="opacity-50">
                <rect x="0" y="8" width="2" height="4" rx="0.5" fill="currentColor" />
                <rect x="4" y="6" width="2" height="6" rx="0.5" fill="currentColor" />
                <rect x="8" y="3" width="2" height="9" rx="0.5" fill="currentColor" />
                <rect x="12" y="0" width="2" height="12" rx="0.5" fill="currentColor" />
              </svg>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" className="opacity-50">
                <path d="M8 12a1 1 0 100-2 1 1 0 000 2zM5 8a4.5 4.5 0 016 0M2 5a8 8 0 0112 0M0 2a11 11 0 0116 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              {/* Battery */}
              <svg width="24" height="12" viewBox="0 0 24 12" className="opacity-50">
                <rect x="0" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <rect x="2" y="3" width="16" height="6" rx="1" fill="currentColor" opacity="0.9" />
                <rect x="20.5" y="4" width="2" height="4" rx="0.5" fill="currentColor" />
              </svg>
            </div>
          </motion.div>

          {/* Page Change Flash Effect */}
          <AnimatePresence>
            {isChangingPage && (
              <>
                {/* Background overlay with gradient pulse */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/10 backdrop-blur-md z-40 pointer-events-none"
                />

                {/* Expanding circles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute inset-0 rounded-full border-2 border-primary/30 z-40 pointer-events-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}

                {/* Center loader */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
                >
                  <OrbitalLoader />
                </motion.div>

                {/* Particles burst */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 1,
                      scale: 1
                    }}
                    animate={{
                      x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                      y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                      opacity: 0,
                      scale: 0
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute w-2 h-2 bg-primary rounded-full z-40 pointer-events-none"
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="h-[calc(100%-88px)] relative">
            <AnimatePresence mode="wait">
              <PageSwipeTransition key={activeTab}>
                {renderPage()}
              </PageSwipeTransition>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation - Enterprise Grade */}
          <AnimatePresence>
            {!showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: showProfile ? 0 : 3.5 }}
                className="absolute bottom-0 left-0 right-0 h-20 z-30 backdrop-blur-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.03)'
                }}
              >
            {/* 5-tab nav: Home · Cards · QR (centre FAB) · Transfer · Wallet */}
            <div className="h-full flex items-center justify-around px-2">
              {[
                { id: 'home',     icon: Home,      label: 'Home'      },
                { id: 'cards',    icon: CreditCard, label: 'Carte'     },
                { id: 'qr',       icon: QrCode,     label: 'Scansiona', fab: true },
                { id: 'transfer', icon: Send,       label: 'Trasferisci' },
                { id: 'wallet',   icon: Wallet,     label: 'Portafoglio' },
              ].map((tab, index) => {
                if (tab.fab) {
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 3.6, type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex flex-col items-center gap-1 -mt-6"
                    >
                      <div
                        className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg"
                        style={{
                          background: activeTab === tab.id
                            ? 'linear-gradient(135deg,#059669,#10B981)'
                            : 'linear-gradient(135deg,#0A0A0A,#1A1A1A)',
                          boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                        }}
                      >
                        <QrCode className="w-6 h-6 text-white" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{tab.label}</span>
                    </motion.button>
                  );
                }
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3.5 + index * 0.07 }}
                    className="flex flex-col items-center gap-1.5 relative py-2 px-3"
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeBg"
                        className="absolute inset-0 bg-black/5 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <motion.div
                      className="relative z-10"
                      animate={activeTab === tab.id ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <tab.icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        strokeWidth={activeTab === tab.id ? 2.5 : 2}
                      />
                    </motion.div>
                    <span className={`text-[10px] font-medium transition-all duration-300 relative z-10 ${
                      activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modals */}
        <TransferModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} />
        <AddMoneyModal isOpen={showAddMoneyModal} onClose={() => setShowAddMoneyModal(false)} />
      </motion.div>
    </ThemeProvider>
  );
}