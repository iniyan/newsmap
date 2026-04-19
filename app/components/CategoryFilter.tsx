'use client';

const CATEGORIES = [
  { id: 'all',           label: 'All',          icon: '🌍', color: '#ffffff' },
  { id: 'Politics',      label: 'Politics',      icon: '🏛️', color: '#ef4444' },
  { id: 'Business',      label: 'Business',      icon: '📈', color: '#eab308' },
  { id: 'Technology',    label: 'Tech',          icon: '💻', color: '#3b82f6' },
  { id: 'Crime',         label: 'Crime',         icon: '🚨', color: '#f97316' },
  { id: 'Sports',        label: 'Sports',        icon: '⚽', color: '#22c55e' },
  { id: 'Health',        label: 'Health',        icon: '🏥', color: '#ec4899' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#a855f7' },
  { id: 'Weather',       label: 'Weather',       icon: '🌪️', color: '#06b6d4' },
  { id: 'General',       label: 'General',       icon: '🌐', color: '#6b7280' },
];

interface Props {
  selected: string;
  onChange: (cat: string) => void;
  /** compact = icon-only pills for tight header */
  compact?: boolean;
}

export default function CategoryFilter({ selected, onChange, compact = false }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            title={cat.label}
            className="shrink-0 flex items-center rounded-full font-semibold transition-all duration-150"
            style={{
              gap: compact ? 0 : 5,
              padding: compact ? '4px 8px' : '5px 12px',
              fontSize: compact ? 11 : 11,
              background: isActive ? `${cat.color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isActive ? cat.color + '80' : 'rgba(255,255,255,0.07)'}`,
              color: isActive ? cat.color : '#6b7280',
              boxShadow: isActive ? `0 0 10px ${cat.color}25` : 'none',
            }}
          >
            <span style={{ fontSize: compact ? 13 : 13, lineHeight: 1 }}>{cat.icon}</span>
            {!compact && <span style={{ marginLeft: 5 }}>{cat.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
