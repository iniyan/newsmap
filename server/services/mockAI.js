const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

const LOCATION_DB = {
  'சென்னை': { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  'chennai': { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
  'மதுரை': { city: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198 },
  'madurai': { city: 'Madurai', state: 'Tamil Nadu', country: 'India', lat: 9.9252, lng: 78.1198 },
  'கோயம்புத்தூர்': { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558 },
  'coimbatore': { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', lat: 11.0168, lng: 76.9558 },
  'திருச்சி': { city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lng: 78.7047 },
  'trichy': { city: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', lat: 10.7905, lng: 78.7047 },
  'சேலம்': { city: 'Salem', state: 'Tamil Nadu', country: 'India', lat: 11.6643, lng: 78.1460 },
  'salem': { city: 'Salem', state: 'Tamil Nadu', country: 'India', lat: 11.6643, lng: 78.1460 },
  'திருநெல்வேலி': { city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', lat: 8.7139, lng: 77.7567 },
  'tirunelveli': { city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India', lat: 8.7139, lng: 77.7567 },
  'வேலூர்': { city: 'Vellore', state: 'Tamil Nadu', country: 'India', lat: 12.9165, lng: 79.1325 },
  'vellore': { city: 'Vellore', state: 'Tamil Nadu', country: 'India', lat: 12.9165, lng: 79.1325 },
  'தஞ்சாவூர்': { city: 'Thanjavur', state: 'Tamil Nadu', country: 'India', lat: 10.7870, lng: 79.1378 },
  'thanjavur': { city: 'Thanjavur', state: 'Tamil Nadu', country: 'India', lat: 10.7870, lng: 79.1378 },
  'ஈரோடு': { city: 'Erode', state: 'Tamil Nadu', country: 'India', lat: 11.3410, lng: 77.7172 },
  'erode': { city: 'Erode', state: 'Tamil Nadu', country: 'India', lat: 11.3410, lng: 77.7172 },
  'தூத்துக்குடி': { city: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', lat: 8.7642, lng: 78.1348 },
  'tuticorin': { city: 'Thoothukudi', state: 'Tamil Nadu', country: 'India', lat: 8.7642, lng: 78.1348 },
  'delhi': { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  'டெல்லி': { city: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  'mumbai': { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  'மும்பை': { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
  'bangalore': { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  'bengaluru': { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
  'hyderabad': { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
  'kolkata': { city: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
  'sri lanka': { city: 'Colombo', state: '', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  'இலங்கை': { city: 'Colombo', state: '', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  'usa': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'america': { city: 'Washington D.C.', state: '', country: 'USA', lat: 38.9072, lng: -77.0369 },
  'china': { city: 'Beijing', state: '', country: 'China', lat: 39.9042, lng: 116.4074 },
  'russia': { city: 'Moscow', state: '', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  'pakistan': { city: 'Islamabad', state: '', country: 'Pakistan', lat: 33.6844, lng: 73.0479 },
  'uk': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'london': { city: 'London', state: '', country: 'UK', lat: 51.5074, lng: -0.1278 },
  'iran': { city: 'Tehran', state: '', country: 'Iran', lat: 35.6892, lng: 51.3890 },
  'இரான்': { city: 'Tehran', state: '', country: 'Iran', lat: 35.6892, lng: 51.3890 },
  'israel': { city: 'Jerusalem', state: '', country: 'Israel', lat: 31.7683, lng: 35.2137 },
};

const DEFAULT_LOCATION = {
  city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707,
};

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
  if (/police|crime|arrest|murder|கொலை|கைது|திருட்டு/.test(text)) return 'Crime';
  if (/election|vote|party|politics|bjp|congress|dmk|aiadmk|தேர்தல்|அரசியல்/.test(text)) return 'Politics';
  if (/tech|technology|ai|software|startup|தொழில்நுட்பம்/.test(text)) return 'Technology';
  if (/sport|cricket|football|tennis|விளையாட்டு|கிரிக்கெட்/.test(text)) return 'Sports';
  if (/film|movie|cinema|actor|actress|திரை|நடிகர்|நடிகை/.test(text)) return 'Entertainment';
  if (/rain|flood|storm|weather|மழை|வெள்ளம்/.test(text)) return 'Weather';
  if (/business|economy|market|stock|வணிகம்|பொருளாதாரம்/.test(text)) return 'Business';
  if (/health|hospital|disease|covid|உடல்நலம்|மருத்துவம்/.test(text)) return 'Health';
  return 'General';
}

async function extractWithAI(title, description) {
  const text = `${title}\n${description}`.slice(0, 600);

  const completion = await groq.chat.completions.create({
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
        content: `Analyze this Tamil/English news article and extract location and category info.

Article: "${text}"

Respond with ONLY this JSON (no markdown fences):
{
  "city": "<most specific city mentioned, or Chennai if Tamil Nadu news with no city>",
  "state": "<state or region>",
  "country": "<country>",
  "lat": <latitude as decimal number>,
  "lng": <longitude as decimal number>,
  "category": "<one of: Politics, Crime, Sports, Technology, Entertainment, Weather, Business, Health, General>",
  "summary": "<1-2 sentence English summary>"
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  const parsed = JSON.parse(match[0]);

  return {
    location: {
      city: parsed.city || DEFAULT_LOCATION.city,
      state: parsed.state || DEFAULT_LOCATION.state,
      country: parsed.country || DEFAULT_LOCATION.country,
      lat: typeof parsed.lat === 'number' ? parsed.lat : DEFAULT_LOCATION.lat,
      lng: typeof parsed.lng === 'number' ? parsed.lng : DEFAULT_LOCATION.lng,
    },
    category: parsed.category || 'General',
    summary: parsed.summary || title,
  };
}

async function processArticle(article, sourceId) {
  const title = article.title || '';
  const description = (article.contentSnippet || article.content || article.summary || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let location, category, summary;

  if (process.env.GROQ_API_KEY) {
    try {
      const aiResult = await extractWithAI(title, description);
      ({ location, category, summary } = aiResult);
    } catch (err) {
      console.warn('[AI] Groq extraction failed, using fallback:', err.message);
    }
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
    intensity_score: Math.floor(Math.random() * 40) + 60,
    sources: [{ id: sourceId, url: article.link || '', title }],
    published_at: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
    timeline: [],
    related_events: [],
  };
}

module.exports = { processArticle };
