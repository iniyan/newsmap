// Global English news RSS feeds — international + strong India coverage
const FEEDS = [
  // ── International wire ──────────────────────────────────────────────
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    lang: 'en',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    lang: 'en',
  },
  {
    id: 'bbc_world',
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    lang: 'en',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    lang: 'en',
  },
  {
    id: 'nytimes',
    name: 'NY Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    lang: 'en',
  },

  // ── India ────────────────────────────────────────────────────────────
  {
    id: 'thehindu',
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/feeder/default.rss',
    lang: 'en',
  },
  {
    id: 'thehindu_national',
    name: 'The Hindu – National',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    lang: 'en',
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    lang: 'en',
  },
  {
    id: 'ndtv_india',
    name: 'NDTV India',
    url: 'https://feeds.feedburner.com/ndtvnews-india-news',
    lang: 'en',
  },
  {
    id: 'toi',
    name: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    lang: 'en',
  },
  {
    id: 'toi_india',
    name: 'Times of India – India',
    url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    lang: 'en',
  },
  {
    id: 'hindustan_times',
    name: 'Hindustan Times',
    url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
    lang: 'en',
  },
  {
    id: 'indian_express',
    name: 'Indian Express',
    url: 'https://indianexpress.com/feed/',
    lang: 'en',
  },
  {
    id: 'india_today',
    name: 'India Today',
    url: 'https://www.indiatoday.in/rss/home',
    lang: 'en',
  },
  {
    id: 'scroll',
    name: 'Scroll.in',
    url: 'https://scroll.in/rss',
    lang: 'en',
  },
  {
    id: 'wire',
    name: 'The Wire',
    url: 'https://thewire.in/feed',
    lang: 'en',
  },
  {
    id: 'deccan_herald',
    name: 'Deccan Herald',
    url: 'https://www.deccanherald.com/rss-feeds/national',
    lang: 'en',
  },
  {
    id: 'mint',
    name: 'Mint',
    url: 'https://www.livemint.com/rss/news',
    lang: 'en',
  },

  // ── Tech / Business ─────────────────────────────────────────────────
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    lang: 'en',
  },
  {
    id: 'bbc_tech',
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    lang: 'en',
  },
];

module.exports = FEEDS;
