'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { SwipeRecord, PredictionType, SwipeDirection } from '@/types';
import ProfileCard from '@/components/ProfileCard';
import PredictionPanel from '@/components/PredictionPanel';
import SwipeResult from '@/components/SwipeResult';
import TopBar from '@/components/TopBar';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function HomePage() {
  const { state, predict, swipe } = useApp();
  const [lastResult, setLastResult] = useState<SwipeRecord | null>(null);
  const [canSwipe, setCanSwipe] = useState(true);

  const currentProfile = state.profiles[state.currentProfileIndex];
  const hasPendingPrediction = state.predictions.some(
    (p) => currentProfile && p.profileId === currentProfile.id && !p.resolved
  );

  const handlePredict = useCallback((type: PredictionType, staked: number) => {
    predict(type, staked);
  }, [predict]);

  const handleSwipe = useCallback((direction: SwipeDirection) => {
    if (!canSwipe) return;
    setCanSwipe(false);
    const record = swipe(direction);
    setLastResult(record);
  }, [canSwipe, swipe]);

  const handleContinue = useCallback(() => {
    setLastResult(null);
    setCanSwipe(true);
  }, []);

  // No more profiles
  if (!currentProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar points={state.wallet.points} streak={state.streak} xp={state.xp} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <Heart size={64} className="text-neutral-700" />
          <h2 className="text-2xl font-bold text-white">Acabaram os perfis!</h2>
          <p className="text-neutral-500 text-sm">Volte depois para mais perfis ou confira seus pontos na Wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar points={state.wallet.points} streak={state.streak} xp={state.xp} />

      {/* Card area */}
      <div className="flex-1 flex flex-col px-4 gap-3">
        <div className="relative flex-1 min-h-[420px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ x: 300, opacity: 0, rotate: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              <ProfileCard
                profile={currentProfile}
                onSwipe={handleSwipe}
                disabled={!canSwipe}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prediction panel */}
        <div className="pb-4">
          <PredictionPanel
            points={state.wallet.points}
            hasPrediction={hasPendingPrediction}
            profileName={currentProfile.name}
            onPredict={handlePredict}
            onSkip={() => {}}
          />
        </div>
      </div>

      {/* Result overlay */}
      {lastResult && (
        <SwipeResult record={lastResult} onContinue={handleContinue} />
      )}
    </div>
  );
}
