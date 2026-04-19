'use client';

const CATEGORIES = [
  { id: 'all',           label: 'All',           icon: '🌍', color: '#ffffff' },
  { id: 'Politics',      label: 'Politics',       icon: '🏛️', color: '#ef4444' },
  { id: 'Business',      label: 'Business',       icon: '📈', color: '#eab308' },
  { id: 'Technology',    label: 'Tech',           icon: '💻', color: '#3b82f6' },
  { id: 'Crime',         label: 'Crime',          icon: '🚨', color: '#f97316' },
  { id: 'Sports',        label: 'Sports',         icon: '⚽', color: '#22c55e' },
  { id: 'Health',        label: 'Health',         icon: '🏥', color: '#ec4899' },
  { id: 'Entertainment', label: 'Entertainment',  icon: '🎬', color: '#a855f7' },
  { id: 'Weather',       label: 'Weather',        icon: '🌪️', color: '#06b6d4' },
  { id: 'General',       label: 'General',        icon: '🌐', color: '#6b7280' },
];

interface CategoryFilterProps {
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: isActive ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isActive ? cat.color : 'rgba(255,255,255,0.08)'}`,
              color: isActive ? cat.color : '#6b7280',
              boxShadow: isActive ? `0 0 12px ${cat.color}33` : 'none',
            }}
          >
            <span className="text-sm leading-none">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
