'use client';

import { motion } from 'framer-motion';
import { Coins, Flame, Zap } from 'lucide-react';
import { calculateLevel } from '@/lib/predictions';

interface TopBarProps {
  points: number;
  streak: number;
  xp: number;
}

export default function TopBar({ points, streak, xp }: TopBarProps) {
  const { level, progress } = calculateLevel(xp);

  return (
    <div className="w-full px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
          Short
        </span>
        <div className="flex items-center gap-1 bg-purple-500/20 rounded-full px-2 py-0.5">
          <Zap size={12} className="text-purple-400" />
          <span className="text-purple-300 text-xs font-bold">Lv.{level}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak */}
        {streak > 0 && (
          <motion.div
            key={streak}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-2.5 py-1"
          >
            <Flame size={14} className="text-orange-400" />
            <span className="text-orange-300 text-xs font-bold">{streak}</span>
          </motion.div>
        )}

        {/* Points */}
        <motion.div
          key={points}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1"
        >
          <Coins size={14} className="text-amber-400" />
          <span className="text-white font-bold text-sm">{points}</span>
        </motion.div>
      </div>
    </div>
  );
}
