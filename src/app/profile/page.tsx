'use client';

import { useApp } from '@/lib/context';
import { calculateLevel } from '@/lib/predictions';
import { motion } from 'framer-motion';
import { User, Zap, Heart, Target, Flame, RotateCcw, Trophy } from 'lucide-react';

export default function ProfilePage() {
  const { state, resetGame } = useApp();
  const { level, progress, nextLevelXp } = calculateLevel(state.xp);

  const totalSwipes = state.swipeHistory.length;
  const matches = state.swipeHistory.filter((s) => s.isMatch).length;
  const matchRate = totalSwipes > 0 ? Math.round((matches / totalSwipes) * 100) : 0;

  const totalPredictions = state.predictions.filter((p) => p.resolved).length;
  const correctPredictions = state.predictions.filter((p) => p.correct).length;
  const predictionRate = totalPredictions > 0
    ? Math.round((correctPredictions / totalPredictions) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6 space-y-6">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
          >
            <User size={40} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-white">Jogador</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Zap size={16} className="text-purple-400" />
              <span className="text-purple-300 font-bold">Level {level}</span>
            </div>
          </div>
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>XP</span>
              <span>{Math.round(progress * nextLevelXp)}/{nextLevelXp}</span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center space-y-1">
            <Heart size={22} className="text-pink-400 mx-auto" />
            <p className="text-2xl font-black text-white">{matches}</p>
            <p className="text-neutral-500 text-xs">Matches</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center space-y-1">
            <Target size={22} className="text-purple-400 mx-auto" />
            <p className="text-2xl font-black text-white">{predictionRate}%</p>
            <p className="text-neutral-500 text-xs">Prediction Acc</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center space-y-1">
            <Flame size={22} className="text-orange-400 mx-auto" />
            <p className="text-2xl font-black text-white">{state.streak}</p>
            <p className="text-neutral-500 text-xs">Streak Atual</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center space-y-1">
            <Trophy size={22} className="text-amber-400 mx-auto" />
            <p className="text-2xl font-black text-white">{totalSwipes}</p>
            <p className="text-neutral-500 text-xs">Total Swipes</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold text-sm">Match Rate</span>
            <span className="text-pink-400 font-bold">{matchRate}%</span>
          </div>
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${matchRate}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
            />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-bold text-sm">Prediction Accuracy</span>
            <span className="text-purple-400 font-bold">{predictionRate}%</span>
          </div>
          <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${predictionRate}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
          <p className="text-neutral-600 text-xs mt-2">
            {correctPredictions}/{totalPredictions} predictions corretas
          </p>
        </div>

        <button
          onClick={resetGame}
          className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 font-medium py-3 rounded-2xl transition-all text-sm"
        >
          <RotateCcw size={16} />
          Recomeçar
        </button>
      </div>
    </div>
  );
}
