'use client';

import { Profile } from '@/types/game';
import { getNashHint } from '@/lib/payoff';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, Brain } from 'lucide-react';
import { useState } from 'react';

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'like' | 'reject') => void;
  disabled?: boolean;
}

export default function SwipeCard({ profile, onSwipe, disabled }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const rejectOpacity = useTransform(x, [-100, 0], [1, 0]);
  const [showHint, setShowHint] = useState(false);
  const [exitX, setExitX] = useState(0);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (disabled) return;
    if (info.offset.x > 100) {
      setExitX(300);
      onSwipe('like');
    } else if (info.offset.x < -100) {
      setExitX(-300);
      onSwipe('reject');
    }
  }

  const personalityEmoji: Record<string, string> = {
    aggressive: '🔥',
    cautious: '🧊',
    random: '🎲',
    mirror: '🪞',
    contrarian: '😈',
  };

  return (
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-800">
        {/* Profile Image Area */}
        <div
          className="h-96 w-full relative flex items-end"
          style={{ background: profile.image }}
        >
          {/* Swipe indicators */}
          <motion.div
            className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-xl border-2 border-white rotate-12"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xl border-2 border-white -rotate-12"
            style={{ opacity: rejectOpacity }}
          >
            NOPE
          </motion.div>

          {/* Personality badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {personalityEmoji[profile.personality] || '❓'} {profile.personality}
            </span>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />

          {/* Name and info */}
          <div className="relative z-10 p-6 w-full">
            <h2 className="text-3xl font-bold text-white">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-neutral-300 mt-1">{profile.bio}</p>
          </div>
        </div>

        {/* Game Theory Hint */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
          >
            <Brain size={16} />
            {showHint ? 'Hide Strategy Intel' : 'View Strategy Intel'}
          </button>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3"
            >
              <p className="text-purple-300 text-sm">
                {getNashHint(profile.personality)}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pb-2">
            <button
              onClick={() => !disabled && onSwipe('reject')}
              disabled={disabled}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center hover:bg-red-500/40 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <X size={28} className="text-red-500" />
            </button>
            <button
              onClick={() => !disabled && onSwipe('like')}
              disabled={disabled}
              className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center hover:bg-green-500/40 transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Heart size={28} className="text-green-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
