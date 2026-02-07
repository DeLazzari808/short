import { PersonalityType, Profile, SwipeAction } from '@/types/game';

const FIRST_NAMES = [
  'Luna', 'Kai', 'Nova', 'Rio', 'Sage', 'Zara', 'Axel', 'Ivy', 'Jett', 'Mika',
  'Aria', 'Dante', 'Elara', 'Felix', 'Gaia', 'Hugo', 'Iris', 'Leo', 'Maya', 'Nico',
  'Olive', 'Phoenix', 'Quinn', 'Remy', 'Stella', 'Theo', 'Uma', 'Vale', 'Wren', 'Xena',
];

const BIOS = [
  'Coffee addict. Dog lover. Will steal your fries. 🍟',
  'Looking for someone to watch sunsets with 🌅',
  'Gym rat by day, Netflix binger by night 💪',
  'If you can\'t handle me at my worst... fair enough tbh',
  'Probably taller than you in heels 👠',
  'Fluent in sarcasm and memes',
  'Adventurer seeking a co-pilot ✈️',
  'Here for a good time, not a long time',
  'My love language is sending memes at 3am',
  'Looking for my player 2 🎮',
  'Swipe right if you like bad decisions',
  'Professional overthinker 🧠',
  'Will judge you by your music taste 🎵',
  'Not here for hookups (unless you\'re really cute)',
  'My therapist says I need to put myself out there',
  'Can cook minute rice in 58 seconds',
  'Warning: may spontaneously start dancing',
  'Emotional availability? In THIS economy?',
  'Looking for someone to split the bill with 💸',
  'I peaked in high school and it\'s been downhill since',
];

const PERSONALITIES: PersonalityType[] = ['aggressive', 'cautious', 'random', 'mirror', 'contrarian'];

// Deterministic seeded random for consistent profile generation
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateProfiles(count: number, seed: number = Date.now()): Profile[] {
  const rand = seededRandom(seed);
  const profiles: Profile[] = [];

  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(rand() * FIRST_NAMES.length);
    const bioIndex = Math.floor(rand() * BIOS.length);
    const personalityIndex = Math.floor(rand() * PERSONALITIES.length);
    const age = 18 + Math.floor(rand() * 17); // 18-34

    // Generate a gradient avatar color
    const hue1 = Math.floor(rand() * 360);
    const hue2 = (hue1 + 40 + Math.floor(rand() * 80)) % 360;

    profiles.push({
      id: `profile-${i}-${seed}`,
      name: FIRST_NAMES[nameIndex],
      age,
      bio: BIOS[bioIndex],
      image: `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 80%, 50%))`,
      personality: PERSONALITIES[personalityIndex],
    });
  }

  return profiles;
}

// AI decision based on personality type
export function getAIDecision(
  personality: PersonalityType,
  playerAction?: SwipeAction
): SwipeAction {
  switch (personality) {
    case 'aggressive':
      // 80% chance of liking
      return Math.random() < 0.8 ? 'like' : 'reject';

    case 'cautious':
      // 25% chance of liking
      return Math.random() < 0.25 ? 'like' : 'reject';

    case 'random':
      // True 50/50
      return Math.random() < 0.5 ? 'like' : 'reject';

    case 'mirror':
      // 70% chance of mirroring the player's action
      if (!playerAction) return Math.random() < 0.5 ? 'like' : 'reject';
      return Math.random() < 0.7 ? playerAction : (playerAction === 'like' ? 'reject' : 'like');

    case 'contrarian':
      // 70% chance of doing the opposite
      if (!playerAction) return Math.random() < 0.5 ? 'like' : 'reject';
      return Math.random() < 0.7
        ? (playerAction === 'like' ? 'reject' : 'like')
        : playerAction;

    default:
      return Math.random() < 0.5 ? 'like' : 'reject';
  }
}
