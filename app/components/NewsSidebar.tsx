'use client';

import { NewsEvent } from '@/app/types';

const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#ef4444', Crime: '#f97316', Sports: '#22c55e',
  Technology: '#3b82f6', Entertainment: '#a855f7', Weather: '#06b6d4',
  Business: '#eab308', Health: '#ec4899', General: '#6b7280',
};

const CATEGORY_ICONS: Record<string, string> = {
  Politics: '🏛️', Crime: '🚨', Sports: '⚽', Technology: '💻',
  Entertainment: '🎬', Weather: '🌪️', Business: '📈', Health: '🏥', General: '🌐',
};

const SOURCE_NAMES: Record<string, string> = {
  reuters: 'Reuters', ap: 'AP', aljazeera: 'Al Jazeera',
  bbc_world: 'BBC', bbc_tech: 'BBC Tech', nytimes: 'NY Times',
  guardian: 'Guardian', thehindu: 'The Hindu', thehindu_national: 'The Hindu',
  ndtv: 'NDTV', ndtv_india: 'NDTV', toi: 'Times of India',
  toi_india: 'Times of India', hindustan_times: 'HT', indian_express: 'IE',
  india_today: 'India Today', scroll: 'Scroll', wire: 'The Wire',
  deccan_herald: 'Deccan Herald', mint: 'Mint', thequint: 'The Quint',
  techcrunch: 'TechCrunch', wired: 'Wired', ft: 'FT',
  vikatan: 'Vikatan', dinamani: 'Dinamani', dinamalar: 'Dinamalar',
  puthiyathalaimurai: 'Puthiya Thalaimurai', bbc_tamil: 'BBC Tamil',
  manorama: 'Manorama', kalki: 'Kalki',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props {
  news: NewsEvent[];
  selected: NewsEvent | null;
  loading: boolean;
  onSelect: (n: NewsEvent) => void;
}

export default function NewsSidebar({ news, selected, loading, onSelect }: Props) {
  const trending = news.filter((n) => n.intensity_score >= 70);
  const rest = news.filter((n) => n.intensity_score < 70);

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Top Stories</h2>
          {loading ? (
            <span className="text-[10px] text-blue-400 animate-pulse">Updating…</span>
          ) : (
            <span className="text-[10px] text-gray-600">{news.length} stories</span>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {loading && news.length === 0 ? (
          <SkeletonList />
        ) : (
          <>
            {/* ── Trending section ── */}
            {trending.length > 0 && (
              <section>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />
                    Trending now
                  </span>
                </div>
                {trending.map((item) => (
                  <NewsCard
                    key={item.event_id}
                    item={item}
                    selected={selected?.event_id === item.event_id}
                    onSelect={onSelect}
                    featured
                  />
                ))}
              </section>
            )}

            {/* ── Latest section ── */}
            {rest.length > 0 && (
              <section>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Latest</span>
                </div>
                {rest.map((item, idx) => (
                  <>
                    <NewsCard
                      key={item.event_id}
                      item={item}
                      selected={selected?.event_id === item.event_id}
                      onSelect={onSelect}
                      featured={false}
                    />
                    {/* Ad slot every 5 cards */}
                    {(idx + 1) % 5 === 0 && <SidebarAd key={`ad-${idx}`} />}
                  </>
                ))}
              </section>
            )}

            {news.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm gap-2">
                <span className="text-3xl">📭</span>
                No stories loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NewsCard({
  item, selected, onSelect, featured,
}: {
  item: NewsEvent; selected: boolean; onSelect: (n: NewsEvent) => void; featured: boolean;
}) {
  const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;
  const icon = CATEGORY_ICONS[item.category] || '🌐';
  const source = SOURCE_NAMES[item.sources[0]?.id] || item.sources[0]?.id || '';

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left px-3 py-2 mx-1 rounded-xl transition-all duration-150 group"
      style={{
        background: selected ? `${color}14` : 'transparent',
        borderLeft: selected ? `2px solid ${color}` : '2px solid transparent',
        width: 'calc(100% - 8px)',
      }}
    >
      <div className="flex gap-2.5">
        {/* Thumbnail */}
        <div
          className="shrink-0 rounded-lg overflow-hidden"
          style={{
            width: featured ? 72 : 56,
            height: featured ? 52 : 42,
            background: `${color}18`,
          }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const ph = img.parentElement?.querySelector('.thumb-ph') as HTMLElement | null;
                if (ph) ph.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="thumb-ph w-full h-full items-center justify-center text-lg"
            style={{ display: item.image_url ? 'none' : 'flex' }}
          >
            {icon}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <p
            className="text-xs leading-snug font-semibold text-gray-200 group-hover:text-white transition-colors line-clamp-2"
            style={{ color: selected ? 'white' : undefined }}
          >
            {item.headline}
          </p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* Category chip */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
              style={{ background: `${color}22`, color }}
            >
              {item.category}
            </span>
            {/* Source */}
            <span className="text-[10px] text-gray-600">{source}</span>
            {/* Time */}
            <span className="text-[10px] text-gray-700 ml-auto">{timeAgo(item.published_at)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

const SIDEBAR_ADS = [
  {
    emoji: '🚀',
    headline: 'Advertise on NewsMap',
    sub: 'Reach engaged readers across India & the world.',
    cta: 'Get started',
    color: '#3b82f6',
  },
  {
    emoji: '🔔',
    headline: 'Never miss a story',
    sub: 'Turn on news alerts for topics you care about.',
    cta: 'Enable now',
    color: '#22c55e',
  },
  {
    emoji: '📊',
    headline: 'NewsMap Premium',
    sub: 'Deep-dive analysis, ad-free experience.',
    cta: 'Try free',
    color: '#a855f7',
  },
];

let adIndex = 0;
function SidebarAd() {
  const ad = SIDEBAR_ADS[adIndex++ % SIDEBAR_ADS.length];
  return (
    <div className="mx-3 my-2 px-3 py-2.5 rounded-xl flex items-start gap-2.5"
      style={{ background: `${ad.color}0d`, border: `1px solid ${ad.color}25` }}>
      <span className="text-xl shrink-0">{ad.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[8px] font-bold uppercase tracking-widest text-gray-700">Ad</span>
        </div>
        <p className="text-[11px] font-semibold leading-snug" style={{ color: ad.color }}>{ad.headline}</p>
        <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{ad.sub}</p>
        <button className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
          style={{ background: `${ad.color}22`, color: ad.color }}>
          {ad.cta} →
        </button>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-1 px-3 pt-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-2.5 p-2 rounded-xl animate-pulse">
          <div className="shrink-0 w-14 h-11 rounded-lg bg-white/5" />
          <div className="flex-1 space-y-1.5 py-1">
            <div className="h-2.5 bg-white/5 rounded-full w-full" />
            <div className="h-2.5 bg-white/5 rounded-full w-3/4" />
            <div className="h-2 bg-white/[0.03] rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
