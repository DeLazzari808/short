// Types para o banco de dados Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  location_lat: number | null;
  location_lng: number | null;
  points: number;
  level: number;
  xp: number;
  created_at: string;
  updated_at: string;
}

export interface ProfilePhoto {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  target_user_id: string;
  direction: 'like' | 'pass';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export type PredictionType = 'match' | 'no_match' | 'they_like' | 'they_pass';

export interface Prediction {
  id: string;
  predictor_id: string;
  target_user_id: string;
  prediction_type: PredictionType;
  points_staked: number;
  odds: number;
  my_action: 'like' | 'pass' | null;
  resolved: boolean;
  correct: boolean | null;
  points_earned: number | null;
  created_at: string;
  resolved_at: string | null;
}

export type TransactionType = 'stake' | 'earn' | 'bonus' | 'spend' | 'refund';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Tipo completo do perfil do usuário (com fotos e interesses)
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  points: number;
  level: number;
  xp: number;
  photos: ProfilePhoto[];
  interests: UserInterest[];
}

// Tipo para perfil exibido no card de swipe
export interface SwipeableProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  distance: string;
  interests: string[];
  verified: boolean;
}
