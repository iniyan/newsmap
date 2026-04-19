'use client';

const CATEGORIES = ['all', 'Politics', 'Crime', 'Sports', 'Technology', 'Entertainment', 'Weather', 'Business', 'Health', 'General'];

const COLORS: Record<string, string> = {
  all: 'bg-white text-black',
  Politics: 'bg-red-500 text-white',
  Crime: 'bg-orange-500 text-white',
  Sports: 'bg-green-500 text-white',
  Technology: 'bg-blue-500 text-white',
  Entertainment: 'bg-purple-500 text-white',
  Weather: 'bg-cyan-500 text-white',
  Business: 'bg-yellow-500 text-black',
  Health: 'bg-pink-500 text-white',
  General: 'bg-gray-500 text-white',
};

interface CategoryFilterProps {
  selected: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all border
            ${selected === cat
              ? `${COLORS[cat]} border-transparent shadow-lg scale-105`
              : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
