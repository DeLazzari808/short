'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SwipeableProfile, PredictionType } from '@/types';

interface UserData {
  id: string;
  points: number;
  level: number;
  xp: number;
  streak: number;
}

interface SwipeResultData {
  success: boolean;
  match: boolean;
  prediction?: {
    id: string;
    correct: boolean;
    points_earned: number;
    type: string;
  };
  pointsEarned: number;
  targetUser: {
    id: string;
    name: string;
    action: 'like' | 'pass' | null;
  };
}

export function useApp() {
  const supabase = createClient();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [profiles, setProfiles] = useState<SwipeableProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check auth
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (!supabaseUser) {
        // Not logged in - use demo mode with mock data
        setUser({
          id: 'demo',
          points: 100,
          level: 1,
          xp: 0,
          streak: 0,
        });
        // Load demo profiles from the existing mock
        const { generateProfiles } = await import('@/lib/profiles');
        const mockProfiles = generateProfiles(20);
        setProfiles(mockProfiles);
        setLoading(false);
        return;
      }

      // Fetch profiles from API
      const response = await fetch('/api/profiles');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profiles');
      }

      setUser(data.user);
      setProfiles(data.profiles);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Predict function - stores prediction to be sent with swipe
  const createPrediction = useCallback(async (
    type: PredictionType, 
    staked: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || user.points < staked) {
      return { success: false, error: 'Pontos insuficientes' };
    }
    // In the real implementation, this would be stored in state and sent with swipe
    return { success: true };
  }, [user]);

  // Swipe function
  const swipe = useCallback(async (direction: 'like' | 'pass', prediction?: { type: PredictionType; staked: number }): Promise<SwipeResultData | null> => {
    const currentProfile = profiles[currentProfileIndex];
    if (!currentProfile) return null;

    try {
      // Check if user is logged in
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (!supabaseUser) {
        // Demo mode - use mock logic
        const mockResult = simulateDemoSwipe(direction, prediction);
        setCurrentProfileIndex(prev => prev + 1);
        
        // Update points in demo mode
        if (mockResult.pointsEarned !== 0) {
          setUser(prev => prev ? { 
            ...prev, 
            points: Math.max(0, prev.points + mockResult.pointsEarned),
            xp: prev.xp + 5,
          } : null);
        }
        
        return mockResult;
      }

      // Real API call
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentProfile.id,
          direction,
          prediction: prediction ? {
            type: prediction.type,
            pointsStaked: prediction.staked,
          } : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to swipe');
      }

      // Update user points
      setUser(prev => prev ? {
        ...prev,
        points: data.user?.points || prev.points,
        xp: prev.xp + 5,
      } : null);

      // Move to next profile
      setCurrentProfileIndex(prev => prev + 1);

      return {
        success: data.success,
        match: data.match,
        prediction: data.prediction,
        pointsEarned: data.pointsEarned,
        targetUser: data.targetUser,
      };
    } catch (err) {
      console.error('Swipe error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [profiles, currentProfileIndex, supabase]);

  // Get current profile
  const currentProfile = profiles[currentProfileIndex] || null;
  const hasMoreProfiles = currentProfileIndex < profiles.length;

  return {
    user,
    currentProfile,
    hasMoreProfiles,
    loading,
    error,
    createPrediction,
    swipe,
    refresh: fetchData,
  };
}

// Demo mode simulation
function simulateDemoSwipe(direction: 'like' | 'pass', prediction?: { type: PredictionType; staked: number }): SwipeResultData {
  const theirAction = Math.random() < 0.45 ? 'like' : 'pass';
  const isMatch = direction === 'like' && theirAction === 'like';

  let predictionResult: SwipeResultData['prediction'] = undefined;
  let pointsEarned = 0;

  if (prediction) {
    // Calculate prediction result
    const odds: Record<PredictionType, number> = {
      match: 2.5,
      no_match: 1.3,
      they_like: 1.8,
      they_pass: 1.5,
    };

    let correct = false;
    switch (prediction.type) {
      case 'match':
        correct = isMatch;
        break;
      case 'no_match':
        correct = !isMatch;
        break;
      case 'they_like':
        correct = theirAction === 'like';
        break;
      case 'they_pass':
        correct = theirAction === 'pass';
        break;
    }

    const earned = correct ? Math.round(prediction.staked * odds[prediction.type]) : -prediction.staked;
    pointsEarned = earned;

    predictionResult = {
      id: `demo-pred-${Date.now()}`,
      correct,
      points_earned: earned,
      type: prediction.type,
    };
  }

  // Base points
  if (isMatch) {
    pointsEarned += 10;
  } else if (direction === 'pass') {
    pointsEarned += 2;
  }

  return {
    success: true,
    match: isMatch,
    prediction: predictionResult,
    pointsEarned,
    targetUser: {
      id: 'demo-target',
      name: 'Usuário',
      action: theirAction,
    },
  };
}
