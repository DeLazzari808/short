'use client';

import { GameState, RoundResult } from '@/types/game';
import { getFinalScore } from '@/lib/game-engine';
import { motion } from 'framer-motion';
import { Trophy, Heart, HeartCrack, TrendingUp, Flame, RotateCcw, History } from 'lucide-react';
import { useState } from 'react';

interface GameOverScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

export default function GameOverScreen({ state, onPlayAgain }: GameOverScreenProps) {
  const score = getFinalScore(state);
  const [showHistory, setShowHistory] = useState(false);

  const isProfit = score.totalProfit >= 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-sm w-full space-y-6"
      >
        {/* Rank */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-6xl"
          >
            {isProfit ? '👑' : '💀'}
          </motion.div>
          <h1 className="text-3xl font-bold text-white">{score.rank}</h1>
          <p className="text-neutral-400">Game Over</p>
        </div>

        {/* Final Balance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-center p-6 rounded-2xl border ${
            isProfit
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          <p className="text-neutral-400 text-sm">Final Balance</p>
          <p className="text-4xl font-bold text-white mt-1">${state.balance}</p>
          <p className={`text-lg font-medium mt-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{score.totalProfit} profit
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <TrendingUp size={20} className="text-green-400 mx-auto mb-1" />
            <p className="text-white font-bold">{score.winRate.toFixed(0)}%</p>
            <p className="text-neutral-500 text-xs">Win Rate</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <Heart size={20} className="text-pink-400 mx-auto mb-1" />
            <p className="text-white font-bold">{score.matchRate.toFixed(0)}%</p>
            <p className="text-neutral-500 text-xs">Match Rate</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <Flame size={20} className="text-orange-400 mx-auto mb-1" />
            <p className="text-white font-bold">{score.bestStreak}</p>
            <p className="text-neutral-500 text-xs">Best Streak</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
            <Trophy size={20} className="text-purple-400 mx-auto mb-1" />
            <p className="text-white font-bold">{state.history.length}</p>
            <p className="text-neutral-500 text-xs">Rounds Played</p>
          </div>
        </motion.div>

        {/* History Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm py-2"
        >
          <History size={16} />
          {showHistory ? 'Hide Match History' : 'Show Match History'}
        </button>

        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-2 max-h-64 overflow-y-auto"
          >
            {state.history.map((round: RoundResult, i: number) => {
              const total = round.balanceChange + round.betResult;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">#{i + 1}</span>
                    {round.isMatch ? (
                      <Heart size={14} className="text-pink-400" fill="currentColor" />
                    ) : (
                      <HeartCrack size={14} className="text-neutral-500" />
                    )}
                    <span className="text-white">{round.profile.name}</span>
                  </div>
                  <span className={`font-bold ${total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {total >= 0 ? '+' : ''}{total}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Play Again */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onPlayAgain}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-lg"
        >
          <RotateCcw size={20} />
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
