import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, Zap, Bitcoin, Wallet } from 'lucide-react';
import { useState } from 'react';

export function CryptoPage() {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  const cryptoAssets = [
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: '0.00234',
      value: '€156.78',
      change: '+12.5%',
      isPositive: true,
      color: 'from-green-400 to-green-600',
      chartData: [40, 45, 42, 48, 55, 52, 58, 62]
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '0.456',
      value: '€892.34',
      change: '+8.2%',
      isPositive: true,
      color: 'from-green-400 to-emerald-600',
      chartData: [30, 35, 38, 36, 42, 45, 48, 50]
    },
    {
      id: 'sol',
      name: 'Solana',
      symbol: 'SOL',
      amount: '12.5',
      value: '€567.90',
      change: '-3.1%',
      isPositive: false,
      color: 'from-neutral-500 to-neutral-800',
      chartData: [50, 52, 48, 45, 42, 44, 43, 41]
    },
    {
      id: 'usdt',
      name: 'Tether',
      symbol: 'USDT',
      amount: '1000',
      value: '€1,000.00',
      change: '+0.01%',
      isPositive: true,
      color: 'from-green-400 to-emerald-600',
      chartData: [50, 50, 50, 50, 50, 50, 50, 50]
    }
  ];

  const totalValue = cryptoAssets.reduce((sum, asset) => {
    return sum + parseFloat(asset.value.replace('€', '').replace(',', ''));
  }, 0);

  return (
    <div className="h-full overflow-y-auto px-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold font-['Outfit']">Crypto Portfolio</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center active:bg-neutral-800 transition-colors"
          >
            <Zap className="w-5 h-5" />
          </motion.button>
        </div>
        <p className="text-muted-foreground text-sm">Track and manage your crypto assets</p>
      </motion.div>

      {/* Total Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-black via-neutral-900 to-black text-white rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden"
      >
        {/* Animated grid background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '20px 20px']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * 300,
              y: Math.random() * 150,
              opacity: 0.3
            }}
            animate={{
              y: [null, Math.random() * 150],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 opacity-70" />
            <span className="text-sm opacity-70">Total Portfolio Value</span>
          </div>
          <motion.div
            className="text-5xl font-['Outfit'] font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            €{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-1 text-green-400 text-sm font-semibold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>+24.8% (24h)</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Buy', icon: ArrowUpRight },
          { label: 'Swap', icon: TrendingUp },
          { label: 'Send', icon: ArrowUpRight }
        ].map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-card rounded-2xl py-3 px-4 flex flex-col items-center gap-2 border border-border hover:bg-accent transition-all shadow-sm hover:shadow-md"
          >
            <action.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Crypto Assets */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Your Assets</h3>
        {cryptoAssets.map((crypto, index) => (
          <motion.div
            key={crypto.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedCrypto(selectedCrypto === crypto.id ? null : crypto.id)}
            className="bg-card rounded-2xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${crypto.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Crypto Icon */}
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${crypto.color} flex items-center justify-center text-white font-bold relative overflow-hidden`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10 text-sm">{crypto.symbol}</span>
                </motion.div>

                <div>
                  <div className="font-semibold">{crypto.name}</div>
                  <div className="text-sm text-muted-foreground">{crypto.amount} {crypto.symbol}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold font-['Outfit']">{crypto.value}</div>
                <div className={`text-sm font-medium flex items-center gap-1 justify-end ${
                  crypto.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {crypto.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{crypto.change}</span>
                </div>
              </div>
            </div>

            {/* Mini Chart */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: selectedCrypto === crypto.id ? 'auto' : 0,
                opacity: selectedCrypto === crypto.id ? 1 : 0
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-end gap-1 h-16">
                  {crypto.chartData.map((value, i) => (
                    <motion.div
                      key={i}
                      className={`flex-1 bg-gradient-to-t ${crypto.color} rounded-t`}
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>7d ago</span>
                  <span>Now</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Market Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 bg-card rounded-2xl p-5 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Market Trends</h3>
          <Bitcoin className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-3">
          {[
            { label: 'Fear & Greed Index', value: '72', status: 'Greed', color: 'text-green-500' },
            { label: 'Total Market Cap', value: '$2.4T', status: '+5.2%', color: 'text-green-600' },
            { label: 'BTC Dominance', value: '52.3%', status: '+1.2%', color: 'text-blue-500' }
          ].map((trend, i) => (
            <motion.div
              key={trend.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">{trend.label}</span>
              <div className="text-right">
                <span className="font-semibold font-['Outfit']">{trend.value}</span>
                <span className={`ml-2 text-sm ${trend.color}`}>{trend.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
