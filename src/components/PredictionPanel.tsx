'use client';

import { PredictionType } from '@/types';
import { getPredictionOdds } from '@/lib/predictions';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';

interface PredictionPanelProps {
  points: number;
  hasPrediction: boolean;
  profileName: string;
  onPredict: (type: PredictionType, staked: number) => void;
  onSkip: () => void;
}

const PREDICTIONS: { type: PredictionType; label: string; emoji: string; color: string }[] = [
  { type: 'match', label: 'Match!', emoji: '💘', color: 'pink' },
  { type: 'no_match', label: 'No match', emoji: '💔', color: 'neutral' },
  { type: 'they_like', label: 'Like de volta', emoji: '😍', color: 'green' },
  { type: 'they_pass', label: 'Vai dar pass', emoji: '🙅', color: 'red' },
];

const STAKE_OPTIONS = [10, 25, 50, 100];

export default function PredictionPanel({ points, hasPrediction, profileName, onPredict, onSkip }: PredictionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<PredictionType | null>(null);
  const [stake, setStake] = useState(10);

  if (hasPrediction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-500/10 border border-purple-500/30 rounded-2xl px-4 py-3 flex items-center gap-2"
      >
        <Target size={16} className="text-purple-400" />
        <span className="text-purple-300 text-sm font-medium">Prediction ativa - agora swipe!</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-neutral-900/90 border border-neutral-700/50 rounded-2xl px-4 py-3 hover:border-purple-500/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target size={18} className="text-purple-400" />
          <span className="text-white font-semibold text-sm">Fazer Prediction</span>
        </div>
        {isOpen ? (
          <ChevronDown size={18} className="text-neutral-400" />
        ) : (
          <ChevronUp size={18} className="text-neutral-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-900/90 border border-neutral-700/50 rounded-2xl p-4 space-y-4">
              <p className="text-neutral-400 text-xs text-center">
                O que vai acontecer com <span className="text-white font-medium">{profileName}</span>?
              </p>

              {/* Prediction choices */}
              <div className="grid grid-cols-2 gap-2">
                {PREDICTIONS.map((pred) => {
                  const odds = getPredictionOdds(pred.type);
                  const isSelected = selected === pred.type;
                  return (
                    <button
                      key={pred.type}
                      onClick={() => setSelected(pred.type)}
                      className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border-2 border-purple-500 text-white'
                          : 'bg-neutral-800/80 border-2 border-transparent text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <span className="text-lg">{pred.emoji}</span>
                      <span className="font-medium text-xs">{pred.label}</span>
                      <span className="text-[10px] text-purple-400 font-bold">{odds}x</span>
                    </button>
                  );
                })}
              </div>

              {/* Stake selector */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    {STAKE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setStake(Math.min(opt, points))}
                        disabled={opt > points}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          stake === opt
                            ? 'bg-purple-500 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 disabled:opacity-25'
                        }`}
                      >
                        {opt}pts
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onPredict(selected, stake);
                        setIsOpen(false);
                        setSelected(null);
                      }}
                      className="flex-1 bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Zap size={16} />
                      Apostar {stake}pts ({getPredictionOdds(selected)}x)
                    </button>
                    <button
                      onClick={() => { setSelected(null); onSkip(); setIsOpen(false); }}
                      className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded-xl transition-all text-sm"
                    >
                      Skip
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button
          onClick={onSkip}
          className="w-full text-neutral-500 text-xs py-1 hover:text-neutral-400 transition-colors"
        >
          Swipe sem prediction →
        </button>
      )}
    </div>
  );
}
