'use client';

import { Heart, History, Wallet, ArrowLeftRight, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', icon: Heart, label: 'Swipe' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/exchange', icon: ArrowLeftRight, label: 'Exchange' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-pink-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={22} fill={isActive ? 'currentColor' : 'none'} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
