const Parser = require('rss-parser');
const FEEDS = require('../data/feeds');
const { processArticle } = require('./mockAI');
const { upsertEvents } = require('./store');

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'NewsMap/1.0 (news aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// TTL cache — skip re-fetching a feed within 5 minutes
const feedCache = new Map(); // feedId → { lastFetched: Date }
const FEED_TTL_MS = 5 * 60 * 1000;

async function ingestFeed(feed, force = false) {
  const cached = feedCache.get(feed.id);
  if (!force && cached && Date.now() - cached.lastFetched < FEED_TTL_MS) {
    console.log(`[ingestion] ${feed.name}: skipped (cached)`);
    return;
  }

  try {
    console.log(`[ingestion] Fetching ${feed.name}...`);
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).slice(0, 20);

    const processed = [];
    for (const item of items) {
      const event = await processArticle(item, feed.id);
      if (event) processed.push(event); // null = location could not be determined, skip
      await sleep(1000);
    }

    upsertEvents(processed);
    feedCache.set(feed.id, { lastFetched: Date.now() });
    console.log(`[ingestion] ${feed.name}: ${processed.length} articles processed`);
  } catch (err) {
    console.error(`[ingestion] ${feed.name} failed:`, err.message);
  }
}

async function ingestAllFeeds(force = false) {
  console.log('[ingestion] Starting feed ingestion...');
  for (const feed of FEEDS) {
    await ingestFeed(feed, force);
  }
  console.log('[ingestion] Done.');
}

module.exports = { ingestAllFeeds };
