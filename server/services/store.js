// In-memory event store (replaces DB for MVP)
let events = [];

function upsertEvents(newEvents) {
  for (const event of newEvents) {
    const existingIdx = events.findIndex(
      (e) => e.headline === event.headline && e.location.city === event.location.city
    );
    if (existingIdx >= 0) {
      // Merge sources
      const existing = events[existingIdx];
      const sourceIds = new Set(existing.sources.map((s) => s.url));
      for (const src of event.sources) {
        if (!sourceIds.has(src.url)) existing.sources.push(src);
      }
      existing.intensity_score = Math.min(100, existing.intensity_score + 5);
    } else {
      events.push(event);
    }
  }
  // Keep last 500 events sorted by recency
  events = events
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 500);
}

function getEvents({ category, bounds } = {}) {
  let result = [...events];
  if (category && category !== 'all') {
    result = result.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }
  if (bounds) {
    const { sw, ne } = bounds;
    result = result.filter(
      (e) =>
        e.location.lat >= sw.lat &&
        e.location.lat <= ne.lat &&
        e.location.lng >= sw.lng &&
        e.location.lng <= ne.lng
    );
  }
  return result;
}

function getEventById(id) {
  return events.find((e) => e.event_id === id) || null;
}

module.exports = { upsertEvents, getEvents, getEventById };
