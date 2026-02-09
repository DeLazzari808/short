'use client';

import { UserProfile } from '@/types';
import { motion, useAnimation } from 'framer-motion';
import { Heart, X, MapPin, BadgeCheck } from 'lucide-react';
import { useState } from 'react';

interface ProfileCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'like' | 'pass') => void;
  disabled?: boolean;
}

export default function ProfileCard({ profile, onSwipe, disabled }: ProfileCardProps) {
  const controls = useAnimation();
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [swiped, setSwiped] = useState(false);

  async function animateOut(direction: 'like' | 'pass') {
    if (swiped) return;
    setSwiped(true);
    const xTarget = direction === 'like' ? 500 : -500;
    const rotTarget = direction === 'like' ? 20 : -20;
    await controls.start({
      x: xTarget,
      rotate: rotTarget,
      opacity: 0,
      transition: { duration: 0.35, ease: 'easeIn' },
    });
    onSwipe(direction);
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    if (disabled || swiped) return;
    const threshold = 80;
    const velocityThreshold = 300;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      animateOut('like');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      animateOut('pass');
    } else {
      controls.start({ x: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } });
      setDragX(0);
    }
  }

  const likeOpacity = Math.max(0, Math.min(1, dragX / 100));
  const passOpacity = Math.max(0, Math.min(1, -dragX / 100));

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      animate={controls}
      drag={disabled || swiped ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDrag={(_: unknown, info: { offset: { x: number } }) => {
        setDragX(info.offset.x);
        setDragging(true);
      }}
      onDragEnd={handleDragEnd}
      onDragStart={() => setDragging(true)}
      whileDrag={{ scale: 1.02 }}
    >
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-2xl">
        {/* Avatar / Image area */}
        <div
          className="absolute inset-0"
          style={{ background: profile.avatar }}
        />

        {/* Swipe Labels */}
        {dragging && (
          <>
            <div
              className="absolute top-8 right-6 z-20 bg-green-500 text-white px-5 py-2 rounded-2xl font-black text-2xl border-4 border-white/80 rotate-12 shadow-lg transition-opacity"
              style={{ opacity: likeOpacity }}
            >
              LIKE
            </div>
            <div
              className="absolute top-8 left-6 z-20 bg-red-500 text-white px-5 py-2 rounded-2xl font-black text-2xl border-4 border-white/80 -rotate-12 shadow-lg transition-opacity"
              style={{ opacity: passOpacity }}
            >
              NOPE
            </div>
          </>
        )}

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
              onClick={(e) => { e.stopPropagation(); if (!disabled && !swiped) animateOut('pass'); }}
              disabled={disabled || swiped}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-red-400/60 flex items-center justify-center hover:bg-red-500/30 transition-all active:scale-90 disabled:opacity-40"
            >
              <X size={30} className="text-red-400" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (!disabled && !swiped) animateOut('like'); }}
              disabled={disabled || swiped}
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
