'use client';

import { useState } from 'react';
import { NewsEvent, EventEngagement } from '@/app/types';
import { likeEvent, bookmarkEvent } from '@/app/lib/api';

const CATEGORY_COLORS: Record<string, string> = {
  Politics: 'bg-red-500',
  Crime: 'bg-orange-500',
  Sports: 'bg-green-500',
  Technology: 'bg-blue-500',
  Entertainment: 'bg-purple-500',
  Weather: 'bg-cyan-500',
  Business: 'bg-yellow-500',
  Health: 'bg-pink-500',
  General: 'bg-gray-500',
};

const SOURCE_NAMES: Record<string, string> = {
  vikatan: 'Vikatan',
  kalki: 'Kalki Online',
  puthiyathalaimurai: 'Puthiya Thalaimurai',
  bbc_tamil: 'BBC Tamil',
};

function intensityLabel(score: number) {
  if (score >= 80) return { label: 'Trending', color: 'text-red-400' };
  if (score >= 60) return { label: 'Active', color: 'text-orange-400' };
  if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400' };
  return { label: 'Low', color: 'text-gray-500' };
}

interface EventDrawerProps {
  event: NewsEvent;
  onClose: () => void;
}

export default function EventDrawer({ event, onClose }: EventDrawerProps) {
  const [eng, setEng] = useState<EventEngagement>(
    event.engagement || { views: 0, likes: 0, bookmarks: 0 }
  );
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const dot = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General;
  const timeAgo = getTimeAgo(event.published_at);
  const { label: intensityText, color: intensityColor } = intensityLabel(event.intensity_score);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    try {
      const updated = await likeEvent(event.event_id);
      setEng(updated);
    } catch { setLiked(false); }
  }

  async function handleBookmark() {
    if (bookmarked) return;
    setBookmarked(true);
    try {
      const updated = await bookmarkEvent(event.event_id);
      setEng(updated);
    } catch { setBookmarked(false); }
  }

  return (
    <div className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-gray-950 border-l border-gray-800 flex flex-col z-10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {event.category}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Thumbnail */}
        <div className="w-full h-44 rounded-lg overflow-hidden bg-gray-900 relative">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.headline}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const placeholder = img.parentElement?.querySelector('.img-placeholder') as HTMLElement | null;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="img-placeholder absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ display: event.image_url ? 'none' : 'flex' }}
          >
            <span className={`inline-block w-3 h-3 rounded-full ${dot}`} />
            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">{event.category}</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-white font-bold text-lg leading-snug">{event.headline}</h2>

        {/* Location + time */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>📍 {event.location.city}{event.location.state ? `, ${event.location.state}` : ''}</span>
          <span>·</span>
          <span>🕐 {timeAgo}</span>
        </div>

        {/* Summary */}
        <p className="text-gray-300 text-sm leading-relaxed">{event.summary}</p>

        {/* Intensity */}
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">News Intensity</span>
              <span className={`text-xs font-bold ${intensityColor}`}>{intensityText}</span>
            </div>
            <span className="text-xs text-gray-500">{event.intensity_score}/100</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all"
              style={{ width: `${event.intensity_score}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            Based on {event.sources.length} source{event.sources.length > 1 ? 's' : ''}, recency, and reader engagement
          </p>
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
              ${liked
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400'
              }`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{eng.likes}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all
              ${bookmarked
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400'
              }`}
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
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sources ({event.sources.length})
          </p>
          <div className="space-y-2">
            {event.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors group"
              >
                <span className="text-xs text-gray-300 truncate flex-1 mr-2">
                  {SOURCE_NAMES[src.id] || src.id}
                </span>
                <span className="text-gray-600 group-hover:text-gray-300 text-xs shrink-0">→</span>
              </a>
            ))}
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
