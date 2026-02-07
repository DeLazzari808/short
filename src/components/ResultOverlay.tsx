'use client';

import { RoundResult } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, Handshake, ShieldX, Coins, TrendingUp, TrendingDown } from 'lucide-react';

interface ResultOverlayProps {
  result: RoundResult | null;
  onContinue: () => void;
}

export default function ResultOverlay({ result, onContinue }: ResultOverlayProps) {
  if (!result) return null;

  const totalChange = result.balanceChange + result.betResult;
  const isPositive = totalChange > 0;

  let icon: React.ReactNode;
  let title: string;
  let subtitle: string;
  let bgColor: string;
  let borderColor: string;

  if (result.isMatch) {
    icon = <Heart size={48} className="text-pink-400" fill="currentColor" />;
    title = "It's a Match! 💕";
    subtitle = 'You both liked each other! Cooperation wins.';
    bgColor = 'from-pink-500/20 to-purple-500/20';
    borderColor = 'border-pink-500/40';
  } else if (result.isMutualReject) {
    icon = <ShieldX size={48} className="text-neutral-400" />;
    title = 'Mutual Pass';
    subtitle = 'Neither of you were interested. Small loss.';
    bgColor = 'from-neutral-500/20 to-neutral-600/20';
    borderColor = 'border-neutral-500/40';
  } else if (result.myAction === 'like' && result.theirAction === 'reject') {
    icon = <HeartCrack size={48} className="text-red-400" />;
    title = 'Rejected! 💔';
    subtitle = 'You put yourself out there... they didn\'t care.';
    bgColor = 'from-red-500/20 to-orange-500/20';
    borderColor = 'border-red-500/40';
  } else {
    icon = <Handshake size={48} className="text-green-400" />;
    title = 'Power Move! 😎';
    subtitle = 'They liked you, but you played it cool.';
    bgColor = 'from-green-500/20 to-emerald-500/20';
    borderColor = 'border-green-500/40';
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onContinue}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`bg-gradient-to-b ${bgColor} border ${borderColor} rounded-3xl p-8 max-w-sm w-full text-center space-y-4 backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            {icon}
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
          </div>

          {/* Payoff breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-2">
              <span className="text-neutral-400 text-sm">Swipe Result</span>
              <span className={`font-bold ${result.balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.balanceChange >= 0 ? '+' : ''}{result.balanceChange}
              </span>
            </div>

            {result.bet && (
              <div className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-2">
                <span className="text-neutral-400 text-sm flex items-center gap-1">
                  <Coins size={14} className="text-amber-400" />
                  Bet ({result.bet.prediction === 'will_like_me' ? 'Like' : 'Reject'})
                </span>
                <span className={`font-bold flex items-center gap-1 ${result.betResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.betResult >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {result.betResult >= 0 ? '+' : ''}{result.betResult}
                </span>
              </div>
            )}

            <div className={`flex justify-between items-center rounded-xl px-4 py-3 border ${isPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <span className="text-white font-medium">Total</span>
              <span className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange}
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-xs text-neutral-500">
            <span className="bg-neutral-800 rounded-lg px-2 py-1">
              You: {result.myAction === 'like' ? '❤️ Like' : '❌ Reject'}
            </span>
            <span className="bg-neutral-800 rounded-lg px-2 py-1">
              {result.profile.name}: {result.theirAction === 'like' ? '❤️ Like' : '❌ Reject'}
            </span>
          </div>

          <button
            onClick={onContinue}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
