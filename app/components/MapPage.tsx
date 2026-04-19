'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { NewsEvent } from '@/app/types';
import { fetchEvents } from '@/app/lib/api';
import NewsDrawer from './NewsDrawer';
import NewsSidebar from './NewsSidebar';
import CategoryFilter from './CategoryFilter';

const NewsMap = dynamic(() => import('./NewsMap'), { ssr: false });

export default function MapPage() {
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsEvent | null>(null);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="w-screen h-screen overflow-hidden flex flex-col" style={{ background: '#080810' }}>

      {/* ══════════════════ TOP BAR ══════════════════ */}
      <header
        className="shrink-0 z-30 flex items-center gap-3 px-4 border-b border-white/[0.06]"
        style={{ height: 52, background: 'rgba(8,8,16,0.98)', backdropFilter: 'blur(16px)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}
          >
            N
          </div>
          <span className="text-white font-black text-base tracking-tight">
            News<span style={{ color: '#ef4444' }}>Map</span>
          </span>
          {/* Live badge */}
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: loading ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)', color: loading ? '#60a5fa' : '#4ade80' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: loading ? '#60a5fa' : '#4ade80', animation: loading ? 'pulse 1s infinite' : 'none' }}
            />
            {loading ? 'Loading' : 'Live'}
          </div>
        </div>

        {/* Category filter — desktop: inline, mobile: hidden (accessible via sidebar) */}
        <div className="hidden md:flex flex-1 min-w-0 overflow-hidden">
          <CategoryFilter selected={category} onChange={handleCategoryChange} compact />
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {trendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {trendingCount} trending
            </div>
          )}
          {lastUpdated && !loading && (
            <span className="hidden lg:inline text-[10px] text-gray-600">
              {news.length} stories · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => loadNews(category)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors border border-white/10 hover:border-white/20 text-sm"
            title="Refresh"
          >↻</button>

          {/* Mobile: news list toggle */}
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors text-sm"
            onClick={() => setSidebarOpen((v) => !v)}
          >☰</button>
        </div>
      </header>

      {/* Mobile: category filter strip */}
      <div className="md:hidden shrink-0 px-3 py-2 border-b border-white/[0.06]"
        style={{ background: 'rgba(8,8,16,0.98)' }}>
        <CategoryFilter selected={category} onChange={handleCategoryChange} compact={false} />
      </div>

      {/* ══════════════════ BODY ══════════════════ */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT SIDEBAR — desktop always visible, mobile slide-over ── */}
        <aside
          className={`
            shrink-0 flex flex-col border-r border-white/[0.06] overflow-hidden z-20
            transition-all duration-300
            md:w-[320px] md:relative md:translate-x-0
            ${sidebarOpen
              ? 'absolute inset-y-0 left-0 w-[85vw] max-w-[360px] translate-x-0'
              : 'absolute -translate-x-full md:translate-x-0'}
          `}
          style={{ background: 'rgba(8,8,16,0.98)' }}
        >
          <NewsSidebar
            news={news}
            selected={selectedNews}
            loading={loading}
            onSelect={(item) => { setSelectedNews(item); setSidebarOpen(false); }}
          />
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="md:hidden absolute inset-0 z-10 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── MAP CENTER ── */}
        <div className="flex-1 relative min-w-0 min-h-0">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#080810' }}>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-xl">⚡</div>
                <p className="text-gray-400 text-sm">{error}</p>
                <button
                  onClick={() => loadNews(category)}
                  className="text-xs px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-all"
                >Try again</button>
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

          {/* Map overlay: legend bottom-left (desktop only) */}
          {!loading && !error && (
            <div className="absolute bottom-6 left-4 z-10 pointer-events-none hidden md:block">
              <Legend />
            </div>
          )}
        </div>

        {/* ── RIGHT DETAIL PANEL — desktop: beside map, mobile: overlay ── */}
        {selectedNews && (
          <div className={`
            shrink-0 z-20
            md:w-[420px] md:relative md:border-l md:border-white/[0.06]
            w-full absolute inset-0 md:inset-auto
          `}>
            <NewsDrawer
              news={selectedNews}
              onClose={() => setSelectedNews(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: 'Politics', color: '#ef4444' },
    { label: 'Business', color: '#eab308' },
    { label: 'Technology', color: '#3b82f6' },
    { label: 'Crime', color: '#f97316' },
    { label: 'Sports', color: '#22c55e' },
    { label: 'Health', color: '#ec4899' },
    { label: 'Entertainment', color: '#a855f7' },
    { label: 'Weather', color: '#06b6d4' },
  ];
  return (
    <div className="px-3 py-2.5 rounded-xl border border-white/[0.06]"
      style={{ background: 'rgba(8,8,16,0.88)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[9px] text-gray-700 mb-1.5 font-bold uppercase tracking-widest">Legend</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[10px] text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
