'use client';

import { SwipeRecord } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, X, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface SwipeResultProps {
  record: SwipeRecord | null;
  onContinue: () => void;
}

export default function SwipeResult({ record, onContinue }: SwipeResultProps) {
  if (!record) return null;

  const isMatch = record.isMatch;
  const iLikedTheyPassed = record.myAction === 'like' && record.theirAction === 'pass';

  let icon: React.ReactNode;
  let title: string;
  let subtitle: string;
  let bg: string;

  if (isMatch) {
    icon = <Heart size={56} className="text-pink-400" fill="currentColor" />;
    title = 'Match! 💘';
    subtitle = `Você e ${record.profile.name} se curtiram!`;
    bg = 'from-pink-500/30 to-purple-500/30';
  } else if (iLikedTheyPassed) {
    icon = <HeartCrack size={56} className="text-red-400" />;
    title = 'Não rolou...';
    subtitle = `${record.profile.name} deu pass em você`;
    bg = 'from-red-500/20 to-neutral-900/20';
  } else if (record.myAction === 'pass' && record.theirAction === 'like') {
    icon = <X size={56} className="text-amber-400" />;
    title = 'Você passou';
    subtitle = `${record.profile.name} tinha te dado like!`;
    bg = 'from-amber-500/20 to-neutral-900/20';
  } else {
    icon = <X size={56} className="text-neutral-400" />;
    title = 'Ambos passaram';
    subtitle = 'Não era pra ser mesmo';
    bg = 'from-neutral-700/20 to-neutral-900/20';
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onContinue}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`bg-gradient-to-b ${bg} bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-5`}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
            className="flex justify-center"
          >
            {icon}
          </motion.div>

          <div>
            <h2 className="text-3xl font-black text-white">{title}</h2>
            <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
          </div>

          {/* Swipe actions breakdown */}
          <div className="flex justify-center gap-3 text-xs">
            <span className={`px-3 py-1.5 rounded-full ${record.myAction === 'like' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              Você: {record.myAction === 'like' ? '❤️ Like' : '❌ Pass'}
            </span>
            <span className={`px-3 py-1.5 rounded-full ${record.theirAction === 'like' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {record.profile.name}: {record.theirAction === 'like' ? '❤️ Like' : '❌ Pass'}
            </span>
          </div>

          {/* Prediction result */}
          {record.prediction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl p-4 border ${
                record.prediction.correct
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target size={16} className="text-purple-400" />
                <span className="text-white font-bold text-sm">Prediction</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                {record.prediction.correct ? (
                  <TrendingUp size={18} className="text-green-400" />
                ) : (
                  <TrendingDown size={18} className="text-red-400" />
                )}
                <span className={`text-2xl font-black ${record.prediction.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {record.prediction.pointsEarned! >= 0 ? '+' : ''}{record.prediction.pointsEarned}pts
                </span>
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                {record.prediction.correct ? 'Você acertou! 🎯' : 'Errou a previsão'}
              </p>
            </motion.div>
          )}

          {/* Points summary */}
          {isMatch && !record.prediction && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-3">
              <span className="text-green-400 font-bold">+10pts</span>
              <p className="text-neutral-500 text-xs">Bônus de match</p>
            </div>
          )}

          <button
            onClick={onContinue}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
          >
            Próximo perfil →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
