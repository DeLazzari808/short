import { UserProfile } from '@/types';

const NAMES = [
  'Sofia', 'Valentina', 'Isabella', 'Camila', 'Mariana',
  'Gabriela', 'Luiza', 'Beatriz', 'Larissa', 'Juliana',
  'Amanda', 'Fernanda', 'Letícia', 'Carolina', 'Bianca',
  'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Pedro',
  'Bruno', 'Diego', 'Thiago', 'André', 'Felipe',
  'Luna', 'Kai', 'Nova', 'Mika', 'Aria',
];

const BIOS = [
  'living my best life ✨',
  'coffee first, questions later ☕',
  'adventure seeker 🌍',
  'gym + netflix = balance',
  'music is my therapy 🎵',
  'dog person. non-negotiable 🐕',
  'foodie exploring the city 🍕',
  'here for genuine connections',
  'sarcasm is my love language',
  'looking for my partner in crime',
  'just moved here, show me around?',
  'photographer 📸 | traveler ✈️',
  'swipe right if you like bad jokes',
  'professional overthinker',
  'let\'s grab drinks and see what happens 🍷',
  'not here to play games... or am I? 🎲',
  'sunset chaser 🌅',
  'can cook, can\'t bake 🍳',
  'tech nerd by day, artist by night 🎨',
  'looking for someone to binge-watch with',
];

const INTERESTS_POOL = [
  'Travel', 'Music', 'Fitness', 'Coffee', 'Photography',
  'Cooking', 'Movies', 'Gaming', 'Art', 'Dogs',
  'Hiking', 'Yoga', 'Dancing', 'Books', 'Wine',
  'Surf', 'Tech', 'Fashion', 'Food', 'Sports',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateProfiles(count: number = 50): UserProfile[] {
  const rand = seededRandom(42);
  const profiles: UserProfile[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = Math.floor(rand() * NAMES.length);
    const bioIdx = Math.floor(rand() * BIOS.length);
    const age = 19 + Math.floor(rand() * 13);
    const hue1 = Math.floor(rand() * 360);
    const hue2 = (hue1 + 30 + Math.floor(rand() * 90)) % 360;
    const distance = (1 + Math.floor(rand() * 25)).toString();
    const verified = rand() > 0.6;

    // Pick 2-4 random interests
    const numInterests = 2 + Math.floor(rand() * 3);
    const shuffled = [...INTERESTS_POOL].sort(() => rand() - 0.5);
    const interests = shuffled.slice(0, numInterests);

    profiles.push({
      id: `user-${i}`,
      name: NAMES[nameIdx],
      age,
      bio: BIOS[bioIdx],
      avatar: `linear-gradient(135deg, hsl(${hue1}, 75%, 55%), hsl(${hue2}, 85%, 45%))`,
      distance: `${distance} km`,
      interests,
      verified,
    });
  }

  return profiles;
}

// Simula a decisão da outra pessoa (50-50 com leve viés)
export function simulateTheirAction(): 'like' | 'pass' {
  return Math.random() < 0.45 ? 'like' : 'pass';
}
