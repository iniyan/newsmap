'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { NewsEvent } from '@/app/types';
import { fetchEvents } from '@/app/lib/api';
import NewsDrawer from './NewsDrawer';
import CategoryFilter from './CategoryFilter';

const NewsMap = dynamic(() => import('./NewsMap'), { ssr: false });

const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#ef4444',
  Crime: '#f97316',
  Sports: '#22c55e',
  Technology: '#3b82f6',
  Entertainment: '#a855f7',
  Weather: '#06b6d4',
  Business: '#eab308',
  Health: '#ec4899',
  General: '#6b7280',
};

export default function MapPage() {
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Request user geolocation on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { timeout: 8000 }
      );
    }
  }, []);

  const loadNews = useCallback(async (cat: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents(cat === 'all' ? undefined : cat);
      setNews(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not load news. Is the server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(category);
    const interval = setInterval(() => loadNews(category), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, loadNews]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSelectedNews(null);
  };

  const trendingCount = news.filter((n) => n.intensity_score >= 70).length;

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* ── Header ── */}
      <header className="shrink-0 z-20 border-b border-white/5" style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="px-4 pt-3 pb-0">
          <div className="flex items-center justify-between mb-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
                  N
                </div>
                {trendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold animate-pulse">
                    {trendingCount > 9 ? '9+' : trendingCount}
                  </span>
                )}
              </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight leading-none">
                  News<span style={{ color: '#ef4444' }}>Map</span>
                </span>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">World news, on the map</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-400 font-medium">Loading</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs text-emerald-400 font-medium">Live</span>
                </div>
              )}
              <button
                onClick={() => loadNews(category)}
                className="p-1.5 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all text-sm"
                title="Refresh"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-4 mb-2 text-xs text-gray-600">
            <span><span className="text-white font-semibold">{news.length}</span> stories</span>
            {trendingCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold">{trendingCount} trending</span>
              </span>
            )}
            {lastUpdated && (
              <span className="ml-auto">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="px-4 pb-2">
          <CategoryFilter selected={category} onChange={handleCategoryChange} />
        </div>
      </header>

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-0">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-xl">
                ⚡
              </div>
              <p className="text-gray-400 text-sm">{error}</p>
              <button
                onClick={() => loadNews(category)}
                className="text-xs px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <NewsMap
            news={news}
            selectedNews={selectedNews}
            onNewsSelect={setSelectedNews}
            userLocation={userLocation}
          />
        )}

        {/* Bottom-left info panel */}
        {!loading && !error && (
          <div className="absolute bottom-6 left-4 flex flex-col gap-2 z-10 pointer-events-none">
            <Legend />
          </div>
        )}

        {/* News drawer */}
        {selectedNews && (
          <NewsDrawer
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Politics', color: '#ef4444' },
    { label: 'Crime', color: '#f97316' },
    { label: 'Sports', color: '#22c55e' },
    { label: 'Tech', color: '#3b82f6' },
    { label: 'Entertainment', color: '#a855f7' },
    { label: 'Weather', color: '#06b6d4' },
    { label: 'Business', color: '#eab308' },
    { label: 'Health', color: '#ec4899' },
  ];
  return (
    <div className="px-3 py-2.5 rounded-xl border border-white/5"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[9px] text-gray-600 mb-1.5 font-bold uppercase tracking-widest">Categories</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
