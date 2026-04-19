const Groq = require('groq-sdk');
const axios = require('axios');

// Defer client creation so missing key doesn't crash on import
let groq = null;
function getGroq() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}
const MODEL = 'llama-3.3-70b-versatile';

const LOCATION_DB = {
  // India
  'chennai': { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  'madurai': { city: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198 },
  'coimbatore': { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558 },
  'trichy': { city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lng: 78.7047 },
  'salem': { city: 'Salem', state: 'Tamil Nadu', country: 'India', lat: 11.6643, lng: 78.1460 },
  'tirunelveli': { city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', lat: 8.7139, lng: 77.7567 },
  'vellore': { city: 'Vellore', state: 'Tamil Nadu', country: 'India', lat: 12.9165, lng: 79.1325 },
  'thanjavur': { city: 'Thanjavur', state: 'Tamil Nadu', country: 'India', lat: 10.7870, lng: 79.1378 },
  'erode': { city: 'Erode', state: 'Tamil Nadu', country: 'India', lat: 11.3410, lng: 77.7172 },
  'tuticorin': { city: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', lat: 8.7642, lng: 78.1348 },
  'thoothukudi': { city: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', lat: 8.7642, lng: 78.1348 },
  'delhi': { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  'new delhi': { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  'mumbai': { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  'bangalore': { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  'bengaluru': { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  'hyderabad': { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
  'kolkata': { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  'pune': { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { city: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
  'india': { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 20.5937, lng: 78.9629 },
  // Asia Pacific
  'sri lanka': { city: 'Colombo', state: '', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  'colombo': { city: 'Colombo', state: '', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  'pakistan': { city: 'Islamabad', state: '', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  'islamabad': { city: 'Islamabad', state: '', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  'karachi': { city: 'Karachi', state: '', country: 'Pakistan', lat: 24.8607, lng: 67.0011 },
  'china': { city: 'Beijing', state: '', country: 'China', lat: 39.9042, lng: 116.4074 },
  'beijing': { city: 'Beijing', state: '', country: 'China', lat: 39.9042, lng: 116.4074 },
  'shanghai': { city: 'Shanghai', state: '', country: 'China', lat: 31.2304, lng: 121.4737 },
  'japan': { city: 'Tokyo', state: '', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  'tokyo': { city: 'Tokyo', state: '', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  'south korea': { city: 'Seoul', state: '', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  'seoul': { city: 'Seoul', state: '', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  'australia': { city: 'Sydney', state: '', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  'sydney': { city: 'Sydney', state: '', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  'indonesia': { city: 'Jakarta', state: '', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  'jakarta': { city: 'Jakarta', state: '', country: 'Indonesia', lat: -6.2088, lng: 106.8456 },
  'myanmar': { city: 'Naypyidaw', state: '', country: 'Myanmar', lat: 19.7633, lng: 96.0785 },
  'bangladesh': { city: 'Dhaka', state: '', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  'dhaka': { city: 'Dhaka', state: '', country: 'Bangladesh', lat: 23.8103, lng: 90.4125 },
  'afghanistan': { city: 'Kabul', state: '', country: 'Afghanistan', lat: 34.5553, lng: 69.2075 },
  'kabul': { city: 'Kabul', state: '', country: 'Afghanistan', lat: 34.5553, lng: 69.2075 },
  // Middle East
  'iran': { city: 'Tehran', state: '', country: 'Iran', lat: 35.6892, lng: 51.3890 },
  'tehran': { city: 'Tehran', state: '', country: 'Iran', lat: 35.6892, lng: 51.3890 },
  'israel': { city: 'Jerusalem', state: '', country: 'Israel', lat: 31.7683, lng: 35.2137 },
  'jerusalem': { city: 'Jerusalem', state: '', country: 'Israel', lat: 31.7683, lng: 35.2137 },
  'tel aviv': { city: 'Tel Aviv', state: '', country: 'Israel', lat: 32.0853, lng: 34.7818 },
  'gaza': { city: 'Gaza', state: '', country: 'Palestine', lat: 31.3547, lng: 34.3088 },
  'saudi arabia': { city: 'Riyadh', state: '', country: 'Saudi Arabia', lat: 24.6877, lng: 46.7219 },
  'riyadh': { city: 'Riyadh', state: '', country: 'Saudi Arabia', lat: 24.6877, lng: 46.7219 },
  'turkey': { city: 'Ankara', state: '', country: 'Turkey', lat: 39.9334, lng: 32.8597 },
  'istanbul': { city: 'Istanbul', state: '', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
  'iraq': { city: 'Baghdad', state: '', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
  'baghdad': { city: 'Baghdad', state: '', country: 'Iraq', lat: 33.3152, lng: 44.3661 },
  'syria': { city: 'Damascus', state: '', country: 'Syria', lat: 33.5138, lng: 36.2765 },
  'ukraine': { city: 'Kyiv', state: '', country: 'Ukraine', lat: 50.4501, lng: 30.5234 },
  'kyiv': { city: 'Kyiv', state: '', country: 'Ukraine', lat: 50.4501, lng: 30.5234 },
  'egypt': { city: 'Cairo', state: '', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  'cairo': { city: 'Cairo', state: '', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
  // Europe
  'uk': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'britain': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'england': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'london': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'russia': { city: 'Moscow', state: '', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  'moscow': { city: 'Moscow', state: '', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  'france': { city: 'Paris', state: '', country: 'France', lat: 48.8566, lng: 2.3522 },
  'paris': { city: 'Paris', state: '', country: 'France', lat: 48.8566, lng: 2.3522 },
  'germany': { city: 'Berlin', state: '', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  'berlin': { city: 'Berlin', state: '', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  'italy': { city: 'Rome', state: '', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  'rome': { city: 'Rome', state: '', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  'spain': { city: 'Madrid', state: '', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  'madrid': { city: 'Madrid', state: '', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  'poland': { city: 'Warsaw', state: '', country: 'Poland', lat: 52.2297, lng: 21.0122 },
  // Americas
  'usa': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'america': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'united states': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'washington': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'new york': { city: 'New York', state: '', country: 'USA', lat: 40.7128, lng: -74.0060 },
  'los angeles': { city: 'Los Angeles', state: '', country: 'USA', lat: 34.0522, lng: -118.2437 },
  'chicago': { city: 'Chicago', state: '', country: 'USA', lat: 41.8781, lng: -87.6298 },
  'silicon valley': { city: 'San Jose', state: 'California', country: 'USA', lat: 37.3382, lng: -121.8863 },
  'canada': { city: 'Ottawa', state: '', country: 'Canada', lat: 45.4215, lng: -75.6972 },
  'toronto': { city: 'Toronto', state: '', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  'brazil': { city: 'Brasília', state: '', country: 'Brazil', lat: -15.7939, lng: -47.8828 },
  'mexico': { city: 'Mexico City', state: '', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  // Africa
  'south africa': { city: 'Johannesburg', state: '', country: 'South Africa', lat: -26.2041, lng: 28.0473 },
  'nigeria': { city: 'Abuja', state: '', country: 'Nigeria', lat: 9.0765, lng: 7.3986 },
  'ethiopia': { city: 'Addis Ababa', state: '', country: 'Ethiopia', lat: 9.0320, lng: 38.7421 },
  'kenya': { city: 'Nairobi', state: '', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  'sudan': { city: 'Khartoum', state: '', country: 'Sudan', lat: 15.5007, lng: 32.5599 },
};

const DEFAULT_LOCATION = {
  city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278,
};

// Rough bounding boxes — if AI returns coords outside these, snap to capital
const COUNTRY_BOUNDS = {
  'India':        { latMin: 6.5,  latMax: 37.5, lngMin: 68.0, lngMax: 97.5,  fallback: { lat: 20.5937, lng: 78.9629 } },
  'Sri Lanka':    { latMin: 5.9,  latMax: 9.9,  lngMin: 79.6, lngMax: 81.9,  fallback: { lat: 7.8731,  lng: 80.7718 } },
  'USA':          { latMin: 24.0, latMax: 49.5, lngMin: -125, lngMax: -66,   fallback: { lat: 38.9072, lng: -77.0369 } },
  'UK':           { latMin: 49.9, latMax: 58.7, lngMin: -8.2, lngMax: 1.8,   fallback: { lat: 51.5074, lng: -0.1278 } },
  'China':        { latMin: 18.0, latMax: 53.5, lngMin: 73.5, lngMax: 135,   fallback: { lat: 39.9042, lng: 116.4074 } },
  'Pakistan':     { latMin: 23.5, latMax: 37.1, lngMin: 60.9, lngMax: 77.8,  fallback: { lat: 33.6844, lng: 73.0479 } },
  'Iran':         { latMin: 25.0, latMax: 39.8, lngMin: 44.0, lngMax: 63.3,  fallback: { lat: 35.6892, lng: 51.3890 } },
  'Russia':       { latMin: 41.0, latMax: 81.9, lngMin: 19.6, lngMax: 180,   fallback: { lat: 55.7558, lng: 37.6173 } },
  'France':       { latMin: 41.3, latMax: 51.1, lngMin: -5.2, lngMax: 9.6,   fallback: { lat: 48.8566, lng: 2.3522 } },
  'Germany':      { latMin: 47.3, latMax: 55.1, lngMin: 5.9,  lngMax: 15.0,  fallback: { lat: 52.5200, lng: 13.4050 } },
  'Australia':    { latMin: -43.6,latMax: -10.7,lngMin: 113.3,lngMax: 153.6, fallback: { lat: -33.8688,lng: 151.2093 } },
  'Brazil':       { latMin: -33.8,latMax: 5.3,  lngMin: -73.6,lngMax: -28.8, fallback: { lat: -15.7939,lng: -47.8828 } },
  'Japan':        { latMin: 24.4, latMax: 45.5, lngMin: 122.9,lngMax: 153.0, fallback: { lat: 35.6762, lng: 139.6503 } },
  'South Korea':  { latMin: 33.0, latMax: 38.6, lngMin: 124.6,lngMax: 129.6, fallback: { lat: 37.5665, lng: 126.9780 } },
  'Canada':       { latMin: 41.7, latMax: 83.1, lngMin: -141, lngMax: -52,   fallback: { lat: 45.4215, lng: -75.6972 } },
  'Ukraine':      { latMin: 44.4, latMax: 52.4, lngMin: 22.1, lngMax: 40.2,  fallback: { lat: 50.4501, lng: 30.5234 } },
};

function validateCoords(lat, lng, country) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  const bounds = COUNTRY_BOUNDS[country];
  if (bounds) {
    return lat >= bounds.latMin && lat <= bounds.latMax &&
           lng >= bounds.lngMin && lng <= bounds.lngMax;
  }
  return true;
}

function snapToCountry(country) {
  const bounds = COUNTRY_BOUNDS[country];
  return bounds ? bounds.fallback : { lat: DEFAULT_LOCATION.lat, lng: DEFAULT_LOCATION.lng };
}

function fallbackLocation(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [keyword, location] of Object.entries(LOCATION_DB)) {
    if (text.includes(keyword.toLowerCase())) return location;
  }
  return {
    ...DEFAULT_LOCATION,
    lat: DEFAULT_LOCATION.lat + (Math.random() - 0.5) * 2,
    lng: DEFAULT_LOCATION.lng + (Math.random() - 0.5) * 2,
  };
}

function fallbackCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (/police|crime|arrest|murder|shooting|stabbing|robbery|convicted|sentenced/.test(text)) return 'Crime';
  if (/election|vote|party|politics|bjp|congress|dmk|parliament|senate|congress|president|minister|diplomat/.test(text)) return 'Politics';
  if (/tech|technology|ai|artificial intelligence|software|startup|silicon|apple|google|microsoft|meta|openai/.test(text)) return 'Technology';
  if (/sport|cricket|football|soccer|tennis|nba|nfl|olympics|championship|tournament|match|league/.test(text)) return 'Sports';
  if (/film|movie|cinema|actor|actress|celebrity|oscar|grammy|entertainment|music|concert/.test(text)) return 'Entertainment';
  if (/rain|flood|storm|hurricane|earthquake|typhoon|wildfire|drought|climate|weather/.test(text)) return 'Weather';
  if (/business|economy|market|stock|trade|gdp|inflation|bank|investment|startup|ipo/.test(text)) return 'Business';
  if (/health|hospital|disease|covid|vaccine|cancer|surgery|pandemic|who|outbreak/.test(text)) return 'Health';
  return 'General';
}

async function extractWithAI(title, description) {
  const text = `${title}\n${description}`.slice(0, 600);

  const completion = await getGroq().chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    max_tokens: 256,
    messages: [
      {
        role: 'system',
        content: 'You are a news geo-extraction assistant. Always respond with valid JSON only, no markdown, no explanation.',
      },
      {
        role: 'user',
        content: `Analyze this global news article and extract the primary location and category.

Article: "${text}"

Rules:
- Use the most specific city/place mentioned in the article
- If multiple locations, use the one most central to the story
- lat/lng must be the actual geographic coordinates of that city (not 0,0 or ocean)
- category must be one of: Politics, Crime, Sports, Technology, Entertainment, Weather, Business, Health, General

Respond with ONLY this JSON (no markdown fences):
{
  "city": "<city name in English>",
  "state": "<state/province or empty string>",
  "country": "<country name in English>",
  "lat": <latitude as decimal, e.g. 51.5074>,
  "lng": <longitude as decimal, e.g. -0.1278>,
  "category": "<category>",
  "summary": "<1-2 sentence factual English summary of the key news>"
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  const parsed = JSON.parse(match[0]);

  const country = parsed.country || DEFAULT_LOCATION.country;
  const lat = typeof parsed.lat === 'number' ? parsed.lat : null;
  const lng = typeof parsed.lng === 'number' ? parsed.lng : null;

  // Snap bad/sea coordinates back to country capital
  let finalLat, finalLng;
  if (lat !== null && lng !== null && validateCoords(lat, lng, country)) {
    finalLat = lat;
    finalLng = lng;
  } else {
    const snapped = snapToCountry(country);
    finalLat = snapped.lat;
    finalLng = snapped.lng;
    console.warn(`[AI] Bad coords (${lat},${lng}) for ${country} — snapped to capital`);
  }

  return {
    location: {
      city: parsed.city || DEFAULT_LOCATION.city,
      state: parsed.state || DEFAULT_LOCATION.state,
      country,
      lat: finalLat,
      lng: finalLng,
    },
    category: parsed.category || 'General',
    summary: parsed.summary || title,
  };
}

// In-process OG image cache to avoid re-fetching same URL
const ogImageCache = new Map();

function extractImageFromRSS(article) {
  // Try common RSS image fields
  if (article.enclosure?.url) return article.enclosure.url;
  if (article['media:content']?.url) return article['media:content'].url;
  if (article['media:thumbnail']?.url) return article['media:thumbnail'].url;
  // Try itunes:image or similar
  if (article['itunes:image']?.href) return article['itunes:image'].href;
  // Try extracting from content/description HTML
  const html = article.content || article.summary || '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

async function scrapeOgImage(url) {
  if (!url) return null;
  if (ogImageCache.has(url)) return ogImageCache.get(url);

  try {
    const res = await axios.get(url, {
      timeout: 6000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'NewsMap/1.0 (news aggregator)',
        'Accept': 'text/html',
      },
      // Only download first 50KB — enough to get <head>
      maxContentLength: 50 * 1024,
      responseType: 'text',
    });

    const html = typeof res.data === 'string' ? res.data : '';

    // Try og:image first
    let match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    // Fallback: twitter:image
    if (!match) match = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!match) match = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    const imageUrl = match ? match[1].trim() : null;
    ogImageCache.set(url, imageUrl);
    return imageUrl;
  } catch (err) {
    ogImageCache.set(url, null);
    return null;
  }
}

async function processArticle(article, sourceId) {
  const title = article.title || '';
  const description = (article.contentSnippet || article.content || article.summary || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 1) Try RSS-embedded image first (fast, no extra request)
  let imageUrl = extractImageFromRSS(article);

  let location, category, summary;

  // 2) Run AI extraction + OG image scrape concurrently
  const [aiResult, ogImage] = await Promise.allSettled([
    getGroq() ? extractWithAI(title, description) : Promise.resolve(null),
    !imageUrl && article.link ? scrapeOgImage(article.link) : Promise.resolve(null),
  ]);

  if (aiResult.status === 'fulfilled' && aiResult.value) {
    ({ location, category, summary } = aiResult.value);
  } else if (aiResult.status === 'rejected') {
    console.warn('[AI] Groq extraction failed, using fallback:', aiResult.reason?.message);
  }

  if (!imageUrl && ogImage.status === 'fulfilled' && ogImage.value) {
    imageUrl = ogImage.value;
    console.log(`[image] OG scraped for "${title.slice(0, 40)}"`);
  }

  if (!location) location = fallbackLocation(title, description);
  if (!category) category = fallbackCategory(title, description);
  if (!summary) summary = description.split(' ').slice(0, 60).join(' ') || title;

  return {
    event_id: `${sourceId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    headline: title,
    summary,
    category,
    location,
    image_url: imageUrl,
    intensity_score: 50,
    sources: [{ id: sourceId, url: article.link || '', title }],
    published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
    timeline: [],
    related_events: [],
  };
}

module.exports = { processArticle };
