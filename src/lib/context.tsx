'use client';

import { createContext, useContext, useCallback, useState, useRef, ReactNode } from 'react';
import { AppState, DigitalAsset, PredictionType, SwipeDirection, SwipeRecord } from '@/types';
import { createInitialState, makePrediction, performSwipe, purchaseAsset } from './store';

interface AppContextType {
  state: AppState;
  predict: (type: PredictionType, staked: number) => void;
  swipe: (direction: SwipeDirection) => SwipeRecord;
  buyAsset: (asset: DigitalAsset) => boolean;
  resetGame: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);
  // Use ref to always have latest state for synchronous reads
  const stateRef = useRef(state);
  stateRef.current = state;

  const predict = useCallback((type: PredictionType, staked: number) => {
    setState((prev) => makePrediction(prev, type, staked));
  }, []);

  const swipe = useCallback((direction: SwipeDirection) => {
    // Compute result from current state synchronously
    const result = performSwipe(stateRef.current, direction);
    setState(result.state);
    return result.record;
  }, []);

  const buyAsset = useCallback((asset: DigitalAsset) => {
    const result = purchaseAsset(stateRef.current, asset);
    if (result) {
      setState(result);
      return true;
    }
    return false;
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  return (
    <AppContext.Provider value={{ state, predict, swipe, buyAsset, resetGame }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
