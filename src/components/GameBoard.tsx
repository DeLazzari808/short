'use client';

import { useState, useCallback } from 'react';
import { GameState, RoundResult, BetPlacement, SwipeAction } from '@/types/game';
import { createInitialState, placeBet, processSwipe, isGameOver } from '@/lib/game-engine';
import SwipeCard from './SwipeCard';
import BetPanel from './BetPanel';
import WalletBar from './WalletBar';
import ResultOverlay from './ResultOverlay';
import GameOverScreen from './GameOverScreen';
import StartScreen from './StartScreen';
import { motion, AnimatePresence } from 'framer-motion';

type GamePhase = 'start' | 'betting' | 'swiping' | 'result' | 'gameover';

export default function GameBoard() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [phase, setPhase] = useState<GamePhase>('start');
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);

  const handleStart = useCallback(() => {
    const newState = createInitialState();
    setGameState(newState);
    setPhase('betting');
    setLastResult(null);
  }, []);

  const handlePlaceBet = useCallback((bet: BetPlacement) => {
    setGameState(prev => placeBet(prev, bet));
    setPhase('swiping');
  }, []);

  const handleSkipBet = useCallback(() => {
    setPhase('swiping');
  }, []);

  const handleSwipe = useCallback((action: SwipeAction) => {
    setGameState(prev => {
      const { newState, result } = processSwipe(prev, action);
      setLastResult(result);
      setPhase('result');
      return newState;
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (isGameOver(gameState)) {
      setPhase('gameover');
    } else {
      setPhase('betting');
      setLastResult(null);
    }
  }, [gameState]);

  if (phase === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (phase === 'gameover') {
    return <GameOverScreen state={gameState} onPlayAgain={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center">
      {/* Top Bar */}
      <WalletBar
        balance={gameState.balance}
        round={gameState.round}
        totalRounds={gameState.totalRounds}
        streak={gameState.streak}
        multiplier={gameState.multiplier}
      />

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm px-4 py-4 gap-4">
        <AnimatePresence mode="wait">
          {gameState.currentProfile && (
            <motion.div
              key={gameState.currentProfile.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full flex justify-center"
            >
              <SwipeCard
                profile={gameState.currentProfile}
                onSwipe={handleSwipe}
                disabled={phase !== 'swiping'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bet Panel - shown during betting phase */}
        {phase === 'betting' && gameState.currentProfile && (
          <div className="w-full mt-auto">
            <BetPanel
              balance={gameState.balance}
              onPlaceBet={handlePlaceBet}
              onSkipBet={handleSkipBet}
              currentBet={gameState.currentBet}
            />
          </div>
        )}

        {/* Show bet info during swiping */}
        {phase === 'swiping' && gameState.currentBet && (
          <div className="w-full mt-auto">
            <BetPanel
              balance={gameState.balance}
              onPlaceBet={handlePlaceBet}
              onSkipBet={handleSkipBet}
              currentBet={gameState.currentBet}
              disabled
            />
          </div>
        )}

        {/* Swipe hint */}
        {phase === 'swiping' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neutral-600 text-xs text-center"
          >
            Swipe or tap the buttons to decide
          </motion.p>
        )}
      </div>

      {/* Result Overlay */}
      <ResultOverlay result={lastResult} onContinue={handleContinue} />
    </div>
  );
}
