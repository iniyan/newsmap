'use client';

import { useState, useRef, useCallback } from 'react';
import { NewsEvent, EventEngagement } from '@/app/types';
import { likeEvent, bookmarkEvent } from '@/app/lib/api';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Politics:      { bg: '#ef4444', text: '#fca5a5', border: 'rgba(239,68,68,0.3)',   glow: '#ef444440' },
  Crime:         { bg: '#f97316', text: '#fdba74', border: 'rgba(249,115,22,0.3)',  glow: '#f9731640' },
  Sports:        { bg: '#22c55e', text: '#86efac', border: 'rgba(34,197,94,0.3)',   glow: '#22c55e40' },
  Technology:    { bg: '#3b82f6', text: '#93c5fd', border: 'rgba(59,130,246,0.3)',  glow: '#3b82f640' },
  Entertainment: { bg: '#a855f7', text: '#d8b4fe', border: 'rgba(168,85,247,0.3)', glow: '#a855f740' },
  Weather:       { bg: '#06b6d4', text: '#67e8f9', border: 'rgba(6,182,212,0.3)',   glow: '#06b6d440' },
  Business:      { bg: '#eab308', text: '#fde047', border: 'rgba(234,179,8,0.3)',   glow: '#eab30840' },
  Health:        { bg: '#ec4899', text: '#f9a8d4', border: 'rgba(236,72,153,0.3)',  glow: '#ec489940' },
  General:       { bg: '#6b7280', text: '#d1d5db', border: 'rgba(107,114,128,0.3)', glow: '#6b728040' },
};

const SOURCE_NAMES: Record<string, string> = {
  reuters: 'Reuters', ap: 'Associated Press', aljazeera: 'Al Jazeera',
  bbc_world: 'BBC World', bbc_tech: 'BBC Technology', nytimes: 'NY Times',
  guardian: 'The Guardian', thehindu: 'The Hindu', thehindu_national: 'The Hindu – National',
  ndtv: 'NDTV', ndtv_india: 'NDTV India', toi: 'Times of India',
  toi_india: 'Times of India', hindustan_times: 'Hindustan Times',
  indian_express: 'Indian Express', india_today: 'India Today',
  scroll: 'Scroll.in', wire: 'The Wire', deccan_herald: 'Deccan Herald',
  mint: 'Mint', thequint: 'The Quint',
  techcrunch: 'TechCrunch', wired: 'Wired', ft: 'Financial Times',
  vikatan: 'Vikatan', dinamani: 'Dinamani', dinamalar: 'Dinamalar',
  puthiyathalaimurai: 'Puthiya Thalaimurai', bbc_tamil: 'BBC Tamil',
  manorama: 'Malayala Manorama', kalki: 'Kalki Online',
};

const CATEGORY_ICONS: Record<string, string> = {
  Politics: '🏛️', Crime: '🚨', Sports: '⚽', Technology: '💻',
  Entertainment: '🎬', Weather: '🌪️', Business: '📈', Health: '🏥', General: '🌐',
};

function intensityLabel(score: number) {
  if (score >= 80) return { label: 'Trending', emoji: '🔥', color: '#ef4444' };
  if (score >= 60) return { label: 'Active', emoji: '⚡', color: '#f97316' };
  if (score >= 40) return { label: 'Moderate', emoji: '📡', color: '#eab308' };
  return { label: 'Quiet', emoji: '💤', color: '#6b7280' };
}

interface NewsDrawerProps {
  news: NewsEvent;
  onClose: () => void;
}

export default function NewsDrawer({ news, onClose }: NewsDrawerProps) {
  const [eng, setEng] = useState<EventEngagement>(
    news.engagement || { views: 0, likes: 0, bookmarks: 0 }
  );
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Swipe-to-close on mobile
  const touchStartY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    // Dismiss if swiped down ≥ 80px from the top of the scroll area
    if (delta > 80 && scrollTop <= 0) onClose();
    touchStartY.current = null;
  }, [onClose]);

  const cat = CATEGORY_COLORS[news.category] || CATEGORY_COLORS.General;
  const timeAgo = getTimeAgo(news.published_at);
  const { label: intensityText, emoji: intensityEmoji, color: intensityColor } = intensityLabel(news.intensity_score);
  const catIcon = CATEGORY_ICONS[news.category] || '🌐';

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    try { const u = await likeEvent(news.event_id); setEng(u); }
    catch { setLiked(false); }
  }

  async function handleBookmark() {
    if (bookmarked) return;
    setBookmarked(true);
    try { const u = await bookmarkEvent(news.event_id); setEng(u); }
    catch { setBookmarked(false); }
  }

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ background: 'rgba(8,8,14,0.99)', backdropFilter: 'blur(20px)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${cat.bg}, transparent)` }} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/5">
        {/* Mobile: back chevron (large tap target) | Desktop: category info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Back button — visible only on mobile */}
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all active:scale-95"
            style={{ background: `${cat.bg}18`, border: `1px solid ${cat.border}`, color: cat.text }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-lg shrink-0">{catIcon}</span>
          <div className="min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cat.text }}>
              {news.category}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span style={{ color: intensityColor }} className="text-xs font-semibold">
                {intensityEmoji} {intensityText}
              </span>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-gray-600 text-xs">{news.intensity_score}/100</span>
            </div>
          </div>
        </div>

        {/* Desktop close button */}
        <button
          onClick={onClose}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-gray-500 hover:text-white transition-all hover:bg-white/10 shrink-0"
        >
          ✕
        </button>

        {/* Mobile swipe hint — only in header */}
        <div className="md:hidden flex flex-col items-center justify-center gap-0.5 px-2 shrink-0">
          <div className="w-6 h-0.5 bg-white/20 rounded-full" />
          <div className="w-4 h-0.5 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>

        {/* Swipe handle for mobile */}
        <div className="md:hidden flex justify-center pt-2 pb-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Hero image */}
        <div className="w-full h-48 md:h-52 relative overflow-hidden" style={{ background: '#111118' }}>
          {news.image_url ? (
            <img
              src={news.image_url}
              alt={news.headline}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const ph = img.parentElement?.querySelector('.img-ph') as HTMLElement | null;
                if (ph) ph.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="img-ph absolute inset-0 flex-col items-center justify-center gap-2"
            style={{ display: news.image_url ? 'none' : 'flex', background: `linear-gradient(135deg, ${cat.glow}, #111118)` }}
          >
            <span className="text-5xl">{catIcon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: cat.text }}>{news.category}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: 'linear-gradient(transparent, rgba(8,8,14,0.97))' }} />
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold"
            style={{ background: `${cat.bg}22`, border: `1px solid ${cat.border}`, color: cat.text }}>
            {SOURCE_NAMES[news.sources[0]?.id] || news.sources[0]?.id || 'News'}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 space-y-4">

          {/* Headline */}
          <h2 className="text-white font-bold text-lg leading-snug pt-2">{news.headline}</h2>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span>📍</span>
              <span>{news.location.city}{news.location.state ? `, ${news.location.state}` : ''}, {news.location.country}</span>
            </span>
            <span className="text-gray-700">·</span>
            <span className="flex items-center gap-1">
              <span>🕐</span>
              <span>{timeAgo}</span>
            </span>
          </div>

          {/* Summary */}
          <p className="text-gray-300 text-sm leading-relaxed border-l-2 pl-3" style={{ borderColor: cat.bg }}>
            {news.summary}
          </p>

          {/* ── Ad slot ── */}
          <AdSlot category={news.category} catColor={cat.bg} catBorder={cat.border} />

          {/* Intensity bar */}
          <div className="rounded-xl p-3 border border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-400">News Intensity</span>
              <span className="text-xs font-bold" style={{ color: intensityColor }}>
                {intensityEmoji} {intensityText} — {news.intensity_score}/100
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${news.intensity_score}%`,
                  background: `linear-gradient(90deg, ${cat.bg}88, ${cat.bg})`,
                  boxShadow: `0 0 8px ${cat.bg}`,
                }}
              />
            </div>
            <p className="text-xs text-gray-700 mt-1.5">
              Based on {news.sources.length} source{news.sources.length !== 1 ? 's' : ''}, recency & engagement
            </p>
          </div>

          {/* Engagement */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: liked ? `${cat.bg}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${liked ? cat.bg : 'rgba(255,255,255,0.08)'}`,
                color: liked ? cat.text : '#9ca3af',
              }}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{eng.likes}</span>
            </button>
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                background: bookmarked ? '#eab30822' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${bookmarked ? '#eab308' : 'rgba(255,255,255,0.08)'}`,
                color: bookmarked ? '#fde047' : '#9ca3af',
              }}
            >
              <span>{bookmarked ? '🔖' : '📌'}</span>
              <span>{eng.bookmarks}</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600">
              <span>👁</span>
              <span>{eng.views}</span>
            </div>
          </div>

          {/* Sources */}
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
              Sources ({news.sources.length})
            </p>
            <div className="space-y-1.5">
              {news.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${cat.bg}11`;
                    (e.currentTarget as HTMLElement).style.borderColor = cat.border;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.bg }} />
                    <span className="text-xs text-gray-300 truncate font-medium">
                      {SOURCE_NAMES[src.id] || src.id}
                    </span>
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-400 text-xs shrink-0 ml-2 transition-colors">↗</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile sticky close bar ── */}
      <div
        className="md:hidden shrink-0 px-4 py-3 border-t border-white/[0.06]"
        style={{ background: 'rgba(8,8,14,0.98)' }}
      >
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            background: `${cat.bg}18`,
            border: `1px solid ${cat.border}`,
            color: cat.text,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to map
        </button>
      </div>
    </div>
  );
}

// ── Ad slot component ────────────────────────────────────────────────
const AD_COPY = [
  { headline: 'Stay ahead of the news.', sub: 'Get personalized alerts for stories that matter to you.', cta: 'Enable alerts', emoji: '🔔' },
  { headline: 'Your ad reaches 50K+ readers.', sub: 'Advertise on NewsMap and connect with engaged news readers.', cta: 'Learn more', emoji: '📣' },
  { headline: 'Read deeper, think wider.', sub: 'Explore premium analysis from expert journalists worldwide.', cta: 'Try premium', emoji: '✨' },
];

function AdSlot({ category, catColor, catBorder }: { category: string; catColor: string; catBorder: string }) {
  const ad = AD_COPY[Math.abs(category.charCodeAt(0)) % AD_COPY.length];
  return (
    <div
      className="rounded-xl px-3 py-3 flex items-start gap-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-xl shrink-0 mt-0.5">{ad.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700">Sponsored</span>
        </div>
        <p className="text-xs font-semibold text-gray-300 leading-snug">{ad.headline}</p>
        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{ad.sub}</p>
        <button
          className="mt-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all"
          style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catBorder}` }}
        >
          {ad.cta} →
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
