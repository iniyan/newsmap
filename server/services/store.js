// In-memory event store
let events = [];

// Engagement store: event_id → { views, likes, bookmarks }
const engagement = new Map();

// --- Filters ---
const JUNK_PATTERNS = [
  /சிறுகதை/,         // short story
  /மினி தொடர்கதை/,  // mini serial story
  /தொடர்கதை/,       // serial story
  /புதினம்/,         // novel
  /கவிதை/,          // poem
  /puzzle/i,
  /crossword/i,
  /horoscope/i,
  /ராசிபலன்/,        // horoscope
  /ஜோதிடம்/,
];

function isJunk(headline, summary) {
  const text = `${headline} ${summary}`;
  return JUNK_PATTERNS.some((p) => p.test(text));
}

// --- Similarity for deduplication ---
// Extract meaningful words (skip short words < 3 chars)
function tokenize(text) {
  return text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
}

function similarity(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  const intersection = [...ta].filter((w) => tb.has(w)).length;
  const union = new Set([...ta, ...tb]).size;
  return union === 0 ? 0 : intersection / union;
}

// Group similar headlines together (Jaccard similarity > 0.4)
function findSimilarEvent(newEvent) {
  return events.find((e) => {
    if (e.location.country !== newEvent.location.country) return false;
    return similarity(e.headline, newEvent.headline) > 0.4;
  });
}

// --- Intensity scoring (real, not random) ---
function calcIntensity(event) {
  const sourceCount = event.sources.length;
  const ageMs = Date.now() - new Date(event.published_at).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Recency score: 100 → 0 over 24 hours
  const recencyScore = Math.max(0, 100 - (ageHours / 24) * 100);

  // Source multiplier: each additional source adds 15 points
  const sourceScore = Math.min(50, sourceCount * 15);

  // Category weight
  const categoryWeight = {
    Politics: 1.2, Crime: 1.1, Weather: 1.15,
    Business: 1.0, Sports: 1.0, Technology: 1.0,
    Health: 1.0, Entertainment: 0.8, General: 0.7,
  };
  const weight = categoryWeight[event.category] || 1.0;

  // Engagement boost
  const eng = engagement.get(event.event_id) || {};
  const engScore = Math.min(20, ((eng.likes || 0) * 2 + (eng.views || 0) * 0.1));

  return Math.min(100, Math.round((recencyScore * 0.5 + sourceScore * 0.3 + engScore * 0.2) * weight));
}

// --- Upsert ---
function upsertEvents(newEvents) {
  for (const event of newEvents) {
    if (isJunk(event.headline, event.summary)) {
      console.log(`[store] Filtered junk: ${event.headline.slice(0, 40)}`);
      continue;
    }

    const similar = findSimilarEvent(event);
    if (similar) {
      // Merge: add source if new, keep best summary (longer one)
      const sourceUrls = new Set(similar.sources.map((s) => s.url));
      for (const src of event.sources) {
        if (!sourceUrls.has(src.url)) similar.sources.push(src);
      }
      if (event.summary.length > similar.summary.length) {
        similar.summary = event.summary;
      }
      similar.intensity_score = calcIntensity(similar);
    } else {
      event.intensity_score = calcIntensity(event);
      if (!engagement.has(event.event_id)) {
        engagement.set(event.event_id, { views: 0, likes: 0, bookmarks: 0 });
      }
      events.push(event);
    }
  }

  // Recalculate intensity for all events (recency changes over time)
  events.forEach((e) => { e.intensity_score = calcIntensity(e); });

  // Keep latest 500, sorted by intensity then recency
  events = events
    .sort((a, b) => b.intensity_score - a.intensity_score || new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 500);
}

// --- Engagement actions ---
function trackView(id) {
  const eng = engagement.get(id);
  if (eng) { eng.views += 1; recalcIntensity(id); }
}

function toggleLike(id) {
  const eng = engagement.get(id);
  if (eng) { eng.likes += 1; recalcIntensity(id); }
  return engagement.get(id);
}

function toggleBookmark(id) {
  const eng = engagement.get(id);
  if (eng) { eng.bookmarks += 1; }
  return engagement.get(id);
}

function recalcIntensity(id) {
  const event = events.find((e) => e.event_id === id);
  if (event) event.intensity_score = calcIntensity(event);
}

function getEngagement(id) {
  return engagement.get(id) || { views: 0, likes: 0, bookmarks: 0 };
}

// --- Queries ---
function getEvents({ category, bounds } = {}) {
  let result = events.map((e) => ({
    ...e,
    engagement: getEngagement(e.event_id),
  }));
  if (category && category !== 'all') {
    result = result.filter((e) => e.category.toLowerCase() === category.toLowerCase());
  }
  if (bounds) {
    const { sw, ne } = bounds;
    result = result.filter(
      (e) =>
        e.location.lat >= sw.lat && e.location.lat <= ne.lat &&
        e.location.lng >= sw.lng && e.location.lng <= ne.lng
    );
  }
  return result;
}

function getEventById(id) {
  const event = events.find((e) => e.event_id === id);
  if (!event) return null;
  trackView(id);
  return { ...event, engagement: getEngagement(id) };
}

module.exports = { upsertEvents, getEvents, getEventById, toggleLike, toggleBookmark };
