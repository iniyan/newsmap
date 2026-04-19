import { NewsEvent } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchEvents(category?: string): Promise<NewsEvent[]> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  const res = await fetch(`${API_URL}/api/events?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events as NewsEvent[];
}

export async function fetchEventById(id: string): Promise<NewsEvent> {
  const res = await fetch(`${API_URL}/api/events/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Event not found');
  return res.json();
}
