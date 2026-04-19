'use client';

import { NewsEvent } from '@/app/types';

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

interface EventDrawerProps {
  event: NewsEvent | null;
  onClose: () => void;
}

export default function EventDrawer({ event, onClose }: EventDrawerProps) {
  if (!event) return null;

  const dot = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General;
  const timeAgo = getTimeAgo(event.published_at);

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
        {/* Headline */}
        <h2 className="text-white font-bold text-lg leading-snug">{event.headline}</h2>

        {/* Location + time */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            📍 {event.location.city}
            {event.location.state ? `, ${event.location.state}` : ''}
          </span>
          <span>·</span>
          <span>🕐 {timeAgo}</span>
        </div>

        {/* Summary */}
        <p className="text-gray-300 text-sm leading-relaxed">{event.summary}</p>

        {/* Intensity */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>News Intensity</span>
            <span>{event.intensity_score}/100</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all"
              style={{ width: `${event.intensity_score}%` }}
            />
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
