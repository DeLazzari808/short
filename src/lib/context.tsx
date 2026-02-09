'use client';

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { AppState, DigitalAsset, PredictionType, SwipeDirection } from '@/types';
import { createInitialState, makePrediction, performSwipe, purchaseAsset } from './store';

interface AppContextType {
  state: AppState;
  predict: (type: PredictionType, staked: number) => void;
  swipe: (direction: SwipeDirection) => ReturnType<typeof performSwipe>['record'];
  buyAsset: (asset: DigitalAsset) => boolean;
  resetGame: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(createInitialState);

  const predict = useCallback((type: PredictionType, staked: number) => {
    setState((prev) => makePrediction(prev, type, staked));
  }, []);

  const swipe = useCallback((direction: SwipeDirection) => {
    let record: ReturnType<typeof performSwipe>['record'] | null = null;
    setState((prev) => {
      const result = performSwipe(prev, direction);
      record = result.record;
      return result.state;
    });
    return record!;
  }, []);

  const buyAsset = useCallback((asset: DigitalAsset) => {
    let success = false;
    setState((prev) => {
      const result = purchaseAsset(prev, asset);
      if (result) {
        success = true;
        return result;
      }
      return prev;
    });
    return success;
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
