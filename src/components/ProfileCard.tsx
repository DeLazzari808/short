'use client';

import { UserProfile } from '@/types';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, BadgeCheck } from 'lucide-react';

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'like' | 'pass') => void;
  disabled?: boolean;
}

export default function ProfileCard({ profile, onSwipe, disabled }: ProfileCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (disabled) return;
    if (info.offset.x > 120) {
      onSwipe('like');
    } else if (info.offset.x < -120) {
      onSwipe('pass');
    }
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate }}
      drag={disabled ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
        {/* Avatar / Image area */}
        <div
          className="absolute inset-0"
          style={{ background: profile.avatar }}
        />

        {/* Swipe Labels */}
        <motion.div
          className="absolute top-8 right-6 z-20 bg-green-500 text-white px-5 py-2 rounded-2xl font-black text-2xl border-4 border-white/80 rotate-12 shadow-lg"
          style={{ opacity: likeOpacity }}
        >
          LIKE
        </motion.div>
        <motion.div
          className="absolute top-8 left-6 z-20 bg-red-500 text-white px-5 py-2 rounded-2xl font-black text-2xl border-4 border-white/80 -rotate-12 shadow-lg"
          style={{ opacity: passOpacity }}
        >
          NOPE
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold text-white">
                {profile.name}, {profile.age}
              </h2>
              {profile.verified && (
                <BadgeCheck size={24} className="text-blue-400" fill="currentColor" />
              )}
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm mt-1">
              <MapPin size={14} />
              <span>{profile.distance}</span>
            </div>
          </div>

          <p className="text-white/80 text-sm">{profile.bio}</p>

          {/* Interests */}
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="bg-white/15 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-5 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); if (!disabled) onSwipe('pass'); }}
              disabled={disabled}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-red-400/60 flex items-center justify-center hover:bg-red-500/30 transition-all active:scale-90 disabled:opacity-40"
            >
              <X size={30} className="text-red-400" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (!disabled) onSwipe('like'); }}
              disabled={disabled}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-green-400/60 flex items-center justify-center hover:bg-green-500/30 transition-all active:scale-90 disabled:opacity-40"
            >
              <Heart size={30} className="text-green-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
