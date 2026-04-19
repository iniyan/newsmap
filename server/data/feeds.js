// Global English news RSS feeds
const FEEDS = [
  // International wire
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://feeds.reuters.com/reuters/topNews',
    lang: 'en',
  },
  {
    id: 'ap',
    name: 'Associated Press',
    url: 'https://rsshub.app/apnews/topics/apf-topnews',
    lang: 'en',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    lang: 'en',
  },
  // BBC
  {
    id: 'bbc_world',
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    lang: 'en',
  },
  {
    id: 'bbc_tech',
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    lang: 'en',
  },
  // US
  {
    id: 'nytimes',
    name: 'NY Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    lang: 'en',
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    lang: 'en',
  },
  // Asia / India
  {
    id: 'thehindu',
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/feeder/default.rss',
    lang: 'en',
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    url: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    lang: 'en',
  },
  // Science / Tech
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    lang: 'en',
  },
  {
    id: 'wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    lang: 'en',
  },
  // Business
  {
    id: 'ft',
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    lang: 'en',
  },
];

module.exports = FEEDS;
