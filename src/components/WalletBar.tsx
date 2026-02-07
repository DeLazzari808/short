'use client';

import { motion } from 'framer-motion';
import { Coins, Flame, Trophy } from 'lucide-react';

interface WalletBarProps {
  balance: number;
  round: number;
  totalRounds: number;
  streak: number;
  multiplier: number;
}

export default function WalletBar({ balance, round, totalRounds, streak, multiplier }: WalletBarProps) {
  return (
    <div className="w-full max-w-sm mx-auto flex items-center justify-between px-2 py-3">
      {/* Balance */}
      <motion.div
        key={balance}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-700 rounded-xl px-3 py-2"
      >
        <Coins size={16} className="text-amber-400" />
        <span className="text-white font-bold text-sm">${balance}</span>
      </motion.div>

      {/* Round counter */}
      <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-700 rounded-xl px-3 py-2">
        <Trophy size={16} className="text-purple-400" />
        <span className="text-neutral-300 text-sm font-medium">
          {round}/{totalRounds}
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/40 rounded-xl px-3 py-2"
        >
          <Flame size={16} className="text-orange-400" />
          <span className="text-orange-400 font-bold text-sm">
            {streak}x
          </span>
          {multiplier > 1 && (
            <span className="text-orange-300 text-xs">({multiplier.toFixed(2)}x)</span>
          )}
        </motion.div>
      )}
    </div>
  );
}
