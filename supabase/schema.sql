-- Schema do Supabase para o app Short (Tinder Clone com Predictions)

-- Tabela de usuários
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  gender VARCHAR(20),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  points INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fotos dos perfis
CREATE TABLE public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interesses do usuário
CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL,
  UNIQUE(user_id, interest)
);

-- Tabela de swipes
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, target_user_id)
);

-- Tabela de matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Tabela de predictions
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predictor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('match', 'no_match', 'they_like', 'they_pass')),
  points_staked INTEGER NOT NULL,
  odds DECIMAL(5,2) NOT NULL,
  my_action VARCHAR(10) CHECK (my_action IN ('like', 'pass')),
  resolved BOOLEAN DEFAULT FALSE,
  correct BOOLEAN,
  points_earned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de transações/pontos
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('stake', 'earn', 'bonus', 'spend', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de conversas/mensagens
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Qualquer usuário logado pode ver outros usuários (para swipe)
CREATE POLICY "Authenticated users can view other profiles" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Swipes: só ver eigenen swipes
CREATE POLICY "Users can manage own swipes" ON public.swipes
  FOR ALL USING (auth.uid() = swiper_id);

-- Predictions: só ver eigenen predictions
CREATE POLICY "Users can manage own predictions" ON public.predictions
  FOR ALL USING (auth.uid() = predictor_id);

-- Transactions: só ver eigenen transações
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Função para obter usuários próximos (simples - sem geolocation complexa)
CREATE OR REPLACE FUNCTION get_profiles_for_swipe(exclude_user_id UUID)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT u.*
  FROM users u
  WHERE u.id != exclude_user_id
  AND u.id NOT IN (
    SELECT target_user_id FROM swipes WHERE swiper_id = exclude_user_id
  )
  ORDER BY RANDOM()
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar match
CREATE OR REPLACE FUNCTION create_match_if_mutual(user1 UUID, user2 UUID)
RETURNS UUID AS $$
DECLARE
  existing_match UUID;
BEGIN
  -- Verifica se já existe match
  SELECT id INTO existing_match
  FROM matches
  WHERE (user1_id = user1 AND user2_id = user2)
     OR (user1_id = user2 AND user2_id = user1);

  IF existing_match IS NOT NULL THEN
    RETURN existing_match;
  END IF;

  -- Verifica se o outro usuário deu like
  IF EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = user2 AND target_user_id = user1 AND direction = 'like'
  ) THEN
    INSERT INTO matches (user1_id, user2_id)
    VALUES (user1, user2)
    RETURNING id INTO existing_match;
    RETURN existing_match;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
