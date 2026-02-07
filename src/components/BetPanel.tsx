'use client';

import { BetPlacement, Prediction } from '@/types/game';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { useState } from 'react';

interface BetPanelProps {
  balance: number;
  onPlaceBet: (bet: BetPlacement) => void;
  onSkipBet: () => void;
  currentBet: BetPlacement | null;
  disabled?: boolean;
}

const BET_PRESETS = [10, 25, 50, 100];

export default function BetPanel({ balance, onPlaceBet, onSkipBet, currentBet, disabled }: BetPanelProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [amount, setAmount] = useState(25);

  if (currentBet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Coins size={18} />
          <span className="font-bold">
            Bet: ${currentBet.amount} on &quot;{currentBet.prediction === 'will_like_me' ? 'They\'ll Like Me' : 'They\'ll Reject Me'}&quot;
          </span>
        </div>
        <p className="text-amber-400/60 text-xs mt-1">Now swipe to see the result!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900/80 border border-neutral-700 rounded-2xl p-4 space-y-3"
    >
      <div className="text-center">
        <h3 className="text-white font-bold text-sm flex items-center justify-center gap-2">
          <Coins size={16} className="text-amber-400" />
          Place Your Bet
        </h3>
        <p className="text-neutral-500 text-xs">Predict their action for bonus cash</p>
      </div>

      {/* Prediction buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPrediction('will_like_me')}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            prediction === 'will_like_me'
              ? 'bg-green-500/30 border-2 border-green-500 text-green-400'
              : 'bg-neutral-800 border-2 border-neutral-700 text-neutral-400 hover:border-neutral-600'
          }`}
        >
          <TrendingUp size={16} />
          They&apos;ll Like
        </button>
        <button
          onClick={() => setPrediction('will_reject_me')}
          disabled={disabled}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            prediction === 'will_reject_me'
              ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
              : 'bg-neutral-800 border-2 border-neutral-700 text-neutral-400 hover:border-neutral-600'
          }`}
        >
          <TrendingDown size={16} />
          They&apos;ll Reject
        </button>
      </div>

      {/* Bet amount */}
      {prediction && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex gap-2 justify-center">
            {BET_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(Math.min(preset, balance))}
                disabled={disabled || preset > balance}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  amount === preset
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 disabled:opacity-30'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onPlaceBet({ prediction, amount });
                setPrediction(null);
              }}
              disabled={disabled || amount <= 0}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition-all text-sm disabled:opacity-50"
            >
              Bet ${amount}
            </button>
            <button
              onClick={() => {
                setPrediction(null);
                onSkipBet();
              }}
              disabled={disabled}
              className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-medium py-2.5 rounded-xl transition-all text-sm"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}

      {!prediction && (
        <button
          onClick={onSkipBet}
          disabled={disabled}
          className="w-full text-neutral-500 hover:text-neutral-400 text-xs py-1 transition-colors"
        >
          Skip betting, just swipe →
        </button>
      )}
    </motion.div>
  );
}
