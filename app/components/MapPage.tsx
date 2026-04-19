'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { NewsEvent } from '@/app/types';
import { fetchEvents } from '@/app/lib/api';
import EventDrawer from './EventDrawer';
import CategoryFilter from './CategoryFilter';

// Mapbox must be client-only (no SSR)
const NewsMap = dynamic(() => import('./NewsMap'), { ssr: false });

export default function MapPage() {
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadEvents = useCallback(async (cat: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents(cat === 'all' ? undefined : cat);
      setEvents(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Could not load events. Is the server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents(category);
    const interval = setInterval(() => loadEvents(category), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, loadEvents]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setSelectedEvent(null);
  };

  return (
    <div className="w-screen h-screen bg-gray-950 overflow-hidden flex flex-col">
      {/* Top bar — in normal flow so it doesn't overlap the map */}
      <header className="shrink-0 z-20 px-4 pt-3 pb-2 bg-gray-950 border-b border-gray-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-xl tracking-tight">News<span className="text-red-500">Map</span></span>
            <span className="text-xs text-gray-500 hidden sm:inline">Tamil News, On the Map</span>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
            )}
            {lastUpdated && !loading && (
              <span className="text-xs text-gray-600">
                {events.length} events
              </span>
            )}
            <button
              onClick={() => loadEvents(category)}
              className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded border border-gray-800 hover:border-gray-600"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
        <CategoryFilter selected={category} onChange={handleCategoryChange} />
      </header>

      {/* Map — fills remaining height below the header */}
      <div className="flex-1 relative min-h-0">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button
                onClick={() => loadEvents(category)}
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <NewsMap
            events={events}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
          />
        )}

        {/* Event count badge */}
        {!loading && !error && (
          <div className="absolute bottom-6 left-4 flex flex-col gap-2 z-10">
            <div className="px-3 py-1.5 bg-gray-950/80 border border-gray-800 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-gray-400">
                <span className="text-white font-semibold">{events.length}</span> events on map
              </p>
            </div>
            <Legend />
          </div>
        )}

        {/* Event drawer */}
        {selectedEvent && (
          <EventDrawer
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
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
  ];
  return (
    <div className="px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg backdrop-blur-sm">
      <p className="text-xs text-gray-600 mb-1.5 font-semibold uppercase tracking-wider">Legend</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-xs text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
