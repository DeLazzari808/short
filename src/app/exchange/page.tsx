'use client';

import { useApp } from '@/lib/context';
import { DIGITAL_ASSETS } from '@/lib/assets';
import { DigitalAsset } from '@/types';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Coins, Check, Lock } from 'lucide-react';
import { useState } from 'react';

export default function ExchangePage() {
  const { state, buyAsset } = useApp();
  const [purchased, setPurchased] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'crypto' | 'nft' | 'token'>('all');

  const filtered = filter === 'all'
    ? DIGITAL_ASSETS
    : DIGITAL_ASSETS.filter((a) => a.category === filter);

  function handleBuy(asset: DigitalAsset) {
    const success = buyAsset(asset);
    if (success) {
      setPurchased(asset.id);
      setTimeout(() => setPurchased(null), 2000);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ArrowLeftRight size={24} className="text-purple-400" />
            Exchange
          </h1>
          <p className="text-neutral-500 text-sm">Troque seus pontos por ativos digitais</p>
        </div>

        <div className="bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/20 rounded-2xl p-5 text-center">
          <p className="text-neutral-400 text-sm">Saldo disponível</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Coins size={24} className="text-amber-400" />
            <span className="text-4xl font-black text-white">{state.wallet.points}</span>
            <span className="text-neutral-500 text-sm">pts</span>
          </div>
        </div>

        <div className="flex gap-2">
          {(['all', 'crypto', 'nft', 'token'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'crypto' ? 'Crypto' : f === 'nft' ? 'NFTs' : 'Tokens'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map((asset, i) => {
            const canAfford = state.wallet.points >= asset.priceInPoints;
            const justPurchased = purchased === asset.id;

            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl shrink-0">
                  {asset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{asset.name}</span>
                    <span className="text-neutral-500 text-xs">{asset.symbol}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      asset.category === 'crypto' ? 'bg-blue-500/20 text-blue-400' :
                      asset.category === 'nft' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-pink-500/20 text-pink-400'
                    }`}>
                      {asset.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5 truncate">{asset.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins size={12} className="text-amber-400" />
                    <span className="text-amber-400 text-xs font-bold">
                      {asset.priceInPoints.toLocaleString()} pts
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(asset)}
                  disabled={!canAfford || justPurchased}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    justPurchased
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : canAfford
                        ? 'bg-purple-500 hover:bg-purple-400 text-white'
                        : 'bg-neutral-800 text-neutral-600'
                  }`}
                >
                  {justPurchased ? (
                    <span className="flex items-center gap-1"><Check size={14} /> OK</span>
                  ) : canAfford ? (
                    'Trocar'
                  ) : (
                    <span className="flex items-center gap-1"><Lock size={12} /> Pts</span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
