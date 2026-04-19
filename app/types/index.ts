export interface EventLocation {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export interface EventSource {
  id: string;
  url: string;
  title: string;
}

export interface EventEngagement {
  views: number;
  likes: number;
  bookmarks: number;
}

export interface NewsEvent {
  event_id: string;
  headline: string;
  summary: string;
  category: string;
  location: EventLocation;
  intensity_score: number;
  sources: EventSource[];
  published_at: string;
  image_url?: string;
  timeline: unknown[];
  related_events: unknown[];
  engagement?: EventEngagement;
}
