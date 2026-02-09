'use client';

import { useApp } from '@/lib/context';
import { Heart, HeartCrack, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const { state } = useApp();
  const { swipeHistory, predictions } = state;

  const resolvedPredictions = predictions.filter((p) => p.resolved);
  const correctPredictions = resolvedPredictions.filter((p) => p.correct);
  const accuracy = resolvedPredictions.length > 0
    ? Math.round((correctPredictions.length / resolvedPredictions.length) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Histórico</h1>
          <p className="text-neutral-500 text-sm">Seus swipes e predictions</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{swipeHistory.length}</p>
            <p className="text-neutral-500 text-xs">Swipes</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-pink-400">
              {swipeHistory.filter((s) => s.isMatch).length}
            </p>
            <p className="text-neutral-500 text-xs">Matches</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-purple-400">{accuracy}%</p>
            <p className="text-neutral-500 text-xs">Prediction Acc</p>
          </div>
        </div>

        <div className="space-y-2">
          {swipeHistory.length === 0 ? (
            <div className="text-center py-12 text-neutral-600">
              <Heart size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum swipe ainda</p>
              <p className="text-xs text-neutral-700">Comece a swipear na aba Home</p>
            </div>
          ) : (
            swipeHistory.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl p-3"
              >
                <div
                  className="w-12 h-12 rounded-xl shrink-0"
                  style={{ background: record.profile.avatar }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm truncate">
                      {record.profile.name}, {record.profile.age}
                    </span>
                    {record.isMatch ? (
                      <Heart size={14} className="text-pink-400 shrink-0" fill="currentColor" />
                    ) : (
                      <HeartCrack size={14} className="text-neutral-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>Você: {record.myAction === 'like' ? '❤️' : '❌'}</span>
                    <span>•</span>
                    <span>{record.profile.name}: {record.theirAction === 'like' ? '❤️' : '❌'}</span>
                  </div>
                </div>
                {record.prediction && (
                  <div className={`flex items-center gap-1 shrink-0 ${
                    record.prediction.correct ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {record.prediction.correct ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-bold">
                      {record.prediction.pointsEarned! >= 0 ? '+' : ''}{record.prediction.pointsEarned}
                    </span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
