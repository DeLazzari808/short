'use client';

import { useApp } from '@/lib/context';
import { motion } from 'framer-motion';
import { Wallet, Coins, TrendingUp, TrendingDown, Package, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function WalletPage() {
  const { state } = useApp();
  const { wallet } = state;

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet size={24} className="text-amber-400" />
            Wallet
          </h1>
          <p className="text-neutral-500 text-sm">Seus pontos e ativos digitais</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-pink-500/20 border border-amber-500/20 rounded-3xl p-6 space-y-4"
        >
          <p className="text-neutral-400 text-sm">Saldo Total</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-white">{wallet.points}</span>
            <span className="text-neutral-400 text-lg mb-1">pts</span>
          </div>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium">+{wallet.totalEarned} ganhos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium">-{wallet.totalSpent} gastos</span>
            </div>
          </div>
          <Link
            href="/exchange"
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-2xl transition-all text-sm mt-2"
          >
            Trocar por Ativos <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
            <Package size={18} className="text-purple-400" />
            Meus Ativos
          </h2>
          {wallet.assets.length === 0 ? (
            <div className="text-center py-8 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl">
              <Coins size={32} className="mx-auto mb-2 text-neutral-700" />
              <p className="text-neutral-500 text-sm">Nenhum ativo ainda</p>
              <p className="text-neutral-600 text-xs mt-1">Ganhe pontos com predictions e troque na Exchange</p>
            </div>
          ) : (
            <div className="space-y-2">
              {wallet.assets.map((item, i) => (
                <motion.div
                  key={item.asset.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-xl">
                    {item.asset.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{item.asset.name}</span>
                      <span className="text-neutral-500 text-xs">{item.asset.symbol}</span>
                    </div>
                    <p className="text-neutral-500 text-xs">{item.pointsSpent.toLocaleString()} pts investidos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">x{item.quantity}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-3">Resumo</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
              <p className="text-green-400 text-2xl font-black">+{wallet.totalEarned}</p>
              <p className="text-neutral-500 text-xs">Total Ganho</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
              <p className="text-red-400 text-2xl font-black">-{wallet.totalSpent}</p>
              <p className="text-neutral-500 text-xs">Total Gasto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
