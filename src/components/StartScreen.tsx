'use client';

import { motion } from 'framer-motion';
import { Heart, Brain, Coins, Zap } from 'lucide-react';
import { PAYOFF_MATRIX } from '@/lib/payoff';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-sm w-full space-y-8 text-center"
      >
        {/* Logo / Title */}
        <div className="space-y-3">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-7xl"
          >
            💘
          </motion.div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500">
            SWIPE & GAMBLE
          </h1>
          <p className="text-neutral-400 text-sm">
            Tinder meets Game Theory meets Gambling
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-left">
            <Heart size={20} className="text-pink-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Swipe Like or Reject</p>
              <p className="text-neutral-500 text-xs">Each person has a hidden personality that affects their choice</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-left">
            <Brain size={20} className="text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Game Theory Payoffs</p>
              <p className="text-neutral-500 text-xs">Your earnings depend on BOTH your choice and theirs</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-left">
            <Coins size={20} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Bet on Outcomes</p>
              <p className="text-neutral-500 text-xs">Predict if they&apos;ll like or reject you for extra cash</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-left">
            <Zap size={20} className="text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium text-sm">Build Streaks</p>
              <p className="text-neutral-500 text-xs">Consecutive wins boost your multiplier</p>
            </div>
          </div>
        </div>

        {/* Payoff Matrix Preview */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center justify-center gap-2">
            <Brain size={14} className="text-purple-400" />
            Payoff Matrix
          </h3>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div />
            <div className="text-green-400 font-medium text-center">They Like</div>
            <div className="text-red-400 font-medium text-center">They Reject</div>

            <div className="text-green-400 font-medium text-right pr-2">You Like</div>
            <div className="bg-green-500/20 rounded-lg p-2 text-center text-green-400 font-bold">
              +{PAYOFF_MATRIX.mutual_match.me}
            </div>
            <div className="bg-red-500/20 rounded-lg p-2 text-center text-red-400 font-bold">
              {PAYOFF_MATRIX.i_liked_they_rejected.me}
            </div>

            <div className="text-red-400 font-medium text-right pr-2">You Reject</div>
            <div className="bg-emerald-500/20 rounded-lg p-2 text-center text-emerald-400 font-bold">
              +{PAYOFF_MATRIX.i_rejected_they_liked.me}
            </div>
            <div className="bg-orange-500/20 rounded-lg p-2 text-center text-orange-400 font-bold">
              {PAYOFF_MATRIX.mutual_reject.me}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-pink-500/20 transition-all hover:shadow-pink-500/40"
        >
          Start Playing — $500
        </motion.button>

        <p className="text-neutral-600 text-xs">15 rounds. Don&apos;t go broke.</p>
      </motion.div>
    </motion.div>
  );
}
