'use client';

import { PredictionType } from '@/types';
import { getPredictionOdds } from '@/lib/predictions';
import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';
import { useState } from 'react';

interface PredictionPanelProps {
  points: number;
  hasPrediction: boolean;
  profileName: string;
  onPredict: (type: PredictionType, staked: number) => void;
  onSkip: () => void;
}

const PREDICTIONS: { type: PredictionType; label: string; emoji: string }[] = [
  { type: 'they_like', label: 'Like', emoji: '😍' },
  { type: 'they_pass', label: 'Pass', emoji: '🙅' },
  { type: 'match', label: 'Match!', emoji: '💘' },
  { type: 'no_match', label: 'No match', emoji: '💔' },
];

const STAKE_OPTIONS = [5, 10, 25, 50];

export default function PredictionPanel({ points, hasPrediction, profileName, onPredict }: PredictionPanelProps) {
  const [selected, setSelected] = useState<PredictionType | null>(null);
  const [stake, setStake] = useState(5);

  if (hasPrediction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-500/10 border border-purple-500/30 rounded-2xl px-4 py-3 flex items-center justify-center gap-2"
      >
        <Target size={16} className="text-purple-400" />
        <span className="text-purple-300 text-sm font-medium">Prediction ativa - agora swipe!</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Quick prediction row - always visible */}
      <div className="flex items-center gap-2">
        <span className="text-neutral-500 text-xs shrink-0">
          <Target size={14} className="inline mr-1" />
          {profileName} vai te dar:
        </span>
        <div className="flex gap-1.5 flex-1">
          {PREDICTIONS.map((pred) => {
            const odds = getPredictionOdds(pred.type);
            const isSelected = selected === pred.type;
            return (
              <button
                key={pred.type}
                onClick={() => setSelected(isSelected ? null : pred.type)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-purple-500/25 border border-purple-500 text-purple-300'
                    : 'bg-neutral-900/80 border border-neutral-800 text-neutral-500 hover:border-neutral-600'
                }`}
              >
                <span>{pred.emoji}</span>
                <span className="hidden sm:inline">{pred.label}</span>
                <span className="text-[10px] text-purple-400/80">{odds}x</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stake + confirm - appears when prediction selected */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2"
        >
          <div className="flex gap-1">
            {STAKE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setStake(Math.min(opt, points))}
                disabled={opt > points}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  stake === opt
                    ? 'bg-purple-500 text-white'
                    : 'bg-neutral-900 text-neutral-500 hover:bg-neutral-800 disabled:opacity-20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              onPredict(selected, stake);
              setSelected(null);
            }}
            disabled={stake <= 0 || stake > points}
            className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
          >
            <Zap size={14} />
            Apostar {stake}pts
          </button>
        </motion.div>
      )}
    </div>
  );
}
