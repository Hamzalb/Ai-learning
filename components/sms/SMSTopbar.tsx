'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, X, ChevronRight, Menu,
  GraduationCap, ClipboardCheck, BookOpen,
  DollarSign, AlertCircle, CheckCircle2, Info,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────
   Notification types & mock data
────────────────────────────────────────────────────────── */
type NotifType = 'grade' | 'attendance' | 'homework' | 'payment' | 'system' | 'info';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: Notification[] = [
  {
    id: '1', type: 'grade', read: false,
    title: 'New Grade Posted',
    body: 'Your Mathematics grade has been updated to A+.',
    time: '2 min ago',
  },
  {
    id: '2', type: 'attendance', read: false,
    title: 'Attendance Marked',
    body: 'You were marked present for today\'s classes.',
    time: '1 hr ago',
  },
  {
    id: '3', type: 'homework', read: false,
    title: 'Homework Due Tomorrow',
    body: 'Physics chapter 5 exercises are due tomorrow.',
    time: '3 hr ago',
  },
  {
    id: '4', type: 'payment', read: true,
    title: 'Payment Received',
    body: 'Your monthly tuition payment has been confirmed.',
    time: 'Yesterday',
  },
  {
    id: '5', type: 'system', read: true,
    title: 'System Update',
    body: 'Platform maintenance scheduled for Sunday 2AM.',
    time: '2 days ago',
  },
  {
    id: '6', type: 'info', read: true,
    title: 'Welcome to EduFlow',
    body: 'Your account is fully set up and ready to use.',
    time: '1 wk ago',
  },
];

const NOTIF_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  grade:      { icon: GraduationCap,   color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  attendance: { icon: ClipboardCheck,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  homework:   { icon: BookOpen,         color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  payment:    { icon: DollarSign,       color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
  system:     { icon: AlertCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
  info:       { icon: Info,             color: 'text-muted-foreground', bg: 'bg-white/[0.04] border-white/[0.06]' },
};

/* ──────────────────────────────────────────────────────────
   Notification Panel
────────────────────────────────────────────────────── */
function NotificationPanel({
  notifs,
  onMarkRead,
  onMarkAll,
  onClose,
}: {
  notifs: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
  onClose: () => void;
}) {
  const unread = notifs.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="notif-panel"
      onClick={e => e.stopPropagation()}
    >
      {/* Top glow */}
      <div className="glow-line-top" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Notifications</span>
          {unread > 0 && (
            <span className="badge badge-violet text-[10px] px-1.5 py-0.5 leading-none">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={onMarkAll}
              className="text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="btn-icon w-7 h-7">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-white/[0.04]">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="icon-box-lg bg-white/[0.03] border border-white/[0.06]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400/50" />
            </div>
            <p className="text-xs text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          notifs.map((n, i) => {
            const meta = NOTIF_META[n.type];
            const Icon = meta.icon;
            return (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: 'spring', stiffness: 340, damping: 28 }}
                onClick={() => onMarkRead(n.id)}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3.5 text-left',
                  'hover:bg-white/[0.03] transition-colors duration-150 group',
                  !n.read && 'bg-primary/[0.03]',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5',
                  meta.bg,
                )}>
                  <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-xs leading-tight',
                      n.read ? 'font-medium text-foreground/70' : 'font-bold text-foreground',
                    )}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-0.5 tabular-nums">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                    {n.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </motion.button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <button className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-medium py-1">
          View all notifications
        </button>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Topbar
────────────────────────────────────────────────────── */
interface SMSTopbarProps {
  onMenuToggle?: () => void;
}

export default function SMSTopbar({ onMenuToggle }: SMSTopbarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifs,       setNotifs]       = useState<Notification[]>(MOCK_NOTIFS);

  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifs.filter(n => !n.read).length;

  // Close panel on outside click
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setNotifOpen(false);
    }
  }, []);

  useEffect(() => {
    if (notifOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [notifOpen, handleOutsideClick]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotifOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const markRead = (id: string) =>
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAll = () =>
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  // Breadcrumb segments
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map(s =>
    s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );

  return (
    <header
      className="h-14 sm:h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 relative z-20"
      style={{
        background: 'hsl(240 42% 4% / 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid hsl(240 22% 14%)',
      }}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

      {/* ── Left: hamburger + breadcrumb ─────────────────── */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden btn-icon w-9 h-9 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          aria-label="Breadcrumb"
          className="flex items-center gap-1 sm:gap-1.5 text-sm min-w-0"
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                {i > 0 && (
                  <ChevronRight className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className={cn(
                  'truncate transition-colors max-w-[100px] sm:max-w-none',
                  isLast
                    ? 'font-semibold text-foreground text-sm'
                    : 'text-muted-foreground/60 hover:text-muted-foreground text-xs hidden sm:inline',
                )}>
                  {crumb}
                </span>
              </span>
            );
          })}
        </motion.nav>
      </div>

      {/* ── Right controls ───────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Search */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              key="search-open"
              initial={{ width: 36, opacity: 0 }}
              animate={{ width: 'clamp(140px, 30vw, 200px)', opacity: 1 }}
              exit={{ width: 36, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Search…"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close search"
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

        {/* ── Notification bell ──────────────────────────── */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className={cn(
              'btn-icon relative',
              notifOpen && 'bg-primary/10 border-primary/30 text-primary',
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell className="w-4 h-4" />
            {/* Unread badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black leading-none px-0.5"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping-slow pointer-events-none" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Dropdown panel */}
          <AnimatePresence>
            {notifOpen && (
              <NotificationPanel
                notifs={notifs}
                onMarkRead={markRead}
                onMarkAll={markAll}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div
          className={cn(
            'w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center',
            'text-white text-sm font-black cursor-pointer select-none',
            'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600',
            'shadow-lg shadow-violet-500/25',
            'transition-transform duration-200 hover:scale-105 active:scale-95',
          )}
          title={user?.name}
          aria-label={`Signed in as ${user?.name}`}
        >
          {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  );
}
