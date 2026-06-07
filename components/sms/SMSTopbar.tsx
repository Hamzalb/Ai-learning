'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, X, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function SMSTopbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map(s =>
    s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );

  return (
    <header
      className="h-16 shrink-0 flex items-center justify-between px-6 relative z-20"
      style={{
        background: 'hsl(240 42% 4% / 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid hsl(240 22% 14%)',
      }}
    >
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

      {/* ── Breadcrumb ───────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="flex items-center gap-1.5 text-sm min-w-0 flex-1"
      >
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={cn(
                  'truncate transition-colors',
                  isLast
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground/60 hover:text-muted-foreground'
                )}
              >
                {crumb}
              </span>
            </span>
          );
        })}
      </motion.nav>

      {/* ── Right Controls ───────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 36, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 36, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={cn(
                  'w-full h-9 pl-8 pr-8 rounded-xl text-sm',
                  'bg-white/[0.05] border border-white/[0.10]',
                  'text-foreground placeholder:text-muted-foreground/60',
                  'focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30',
                  'transition-all duration-200',
                )}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="search-icon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="btn-icon"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <button className="btn-icon relative" aria-label="Notifications">
          <Bell className="w-4 h-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500">
            <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping-slow" />
          </span>
        </button>

        {/* Avatar */}
        <div className="relative group">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              'text-white text-sm font-black cursor-pointer',
              'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600',
              'shadow-lg shadow-violet-500/25',
              'transition-transform duration-200 hover:scale-105',
            )}
            title={user?.name}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
