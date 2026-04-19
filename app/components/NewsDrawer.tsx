'use client';

import { useState } from 'react';
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
  mint: 'Mint', techcrunch: 'TechCrunch', wired: 'Wired', ft: 'Financial Times',
  vikatan: 'Vikatan', kalki: 'Kalki Online',
  puthiyathalaimurai: 'Puthiya Thalaimurai', bbc_tamil: 'BBC Tamil',
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

  const cat = CATEGORY_COLORS[news.category] || CATEGORY_COLORS.General;
  const timeAgo = getTimeAgo(news.published_at);
  const { label: intensityText, emoji: intensityEmoji, color: intensityColor } = intensityLabel(news.intensity_score);
  const catIcon = CATEGORY_ICONS[news.category] || '🌐';

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    try {
      const updated = await likeEvent(news.event_id);
      setEng(updated);
    } catch { setLiked(false); }
  }

  async function handleBookmark() {
    if (bookmarked) return;
    setBookmarked(true);
    try {
      const updated = await bookmarkEvent(news.event_id);
      setEng(updated);
    } catch { setBookmarked(false); }
  }

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        background: 'rgba(8,8,14,0.99)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Top accent bar ── */}
      <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${cat.bg}, transparent)` }} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{catIcon}</span>
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: cat.text }}
            >
              {news.category}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span style={{ color: intensityColor }} className="text-xs font-semibold">
                {intensityEmoji} {intensityText}
              </span>
              <span className="text-gray-700 text-xs">·</span>
              <span className="text-gray-600 text-xs">{news.intensity_score}/100</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white transition-all hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Thumbnail */}
        <div className="w-full h-52 relative overflow-hidden" style={{ background: '#111118' }}>
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
            <span className="text-4xl">{catIcon}</span>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: cat.text }}>{news.category}</span>
          </div>
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-16"
            style={{ background: 'linear-gradient(transparent, rgba(8,8,14,0.97))' }} />
          {/* Source badge */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold"
            style={{ background: `${cat.bg}22`, border: `1px solid ${cat.border}`, color: cat.text }}>
            {SOURCE_NAMES[news.sources[0]?.id] || news.sources[0]?.id || 'News'}
          </div>
        </div>

        {/* Content pad */}
        <div className="px-4 pb-6 space-y-4">

          {/* Headline */}
          <h2 className="text-white font-bold text-lg leading-snug pt-2">{news.headline}</h2>

          {/* Meta row */}
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
                className="h-full rounded-full transition-all"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: bookmarked ? '#eab30822' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${bookmarked ? '#eab308' : 'rgba(255,255,255,0.08)'}`,
                color: bookmarked ? '#fde047' : '#9ca3af',
              }}
            >
              <span>{bookmarked ? '🔖' : '📌'}</span>
              <span>{eng.bookmarks}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600">
              <span>👁</span>
              <span>{eng.views} views</span>
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
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
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
