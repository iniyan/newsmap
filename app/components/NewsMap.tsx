'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NewsEvent } from '@/app/types';

const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#ef4444',
  Crime: '#f97316',
  Sports: '#22c55e',
  Technology: '#3b82f6',
  Entertainment: '#a855f7',
  Weather: '#06b6d4',
  Business: '#eab308',
  Health: '#ec4899',
  General: '#6b7280',
};

interface NewsMapProps {
  events: NewsEvent[];
  selectedEvent: NewsEvent | null;
  onEventSelect: (event: NewsEvent) => void;
}

export default function NewsMap({ events, selectedEvent, onEventSelect }: NewsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [80.2707, 13.0827], // Chennai
      zoom: 5.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (!map.current) return;

    clearMarkers();

    events.forEach((event) => {
      const color = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General;
      const size = 12 + Math.floor((event.intensity_score / 100) * 20);

      // Wrapper anchors the marker; inner dot scales without shifting position
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const dot = document.createElement('div');
      dot.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 ${size}px ${color}88;
        transform-origin: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      `;

      wrapper.appendChild(dot);

      wrapper.addEventListener('mouseenter', () => {
        dot.style.transform = 'scale(1.4)';
        dot.style.boxShadow = `0 0 ${size * 2}px ${color}cc`;
      });
      wrapper.addEventListener('mouseleave', () => {
        dot.style.transform = 'scale(1)';
        dot.style.boxShadow = `0 0 ${size}px ${color}88`;
      });
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        onEventSelect(event);
      });

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: 'center' })
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [events, clearMarkers, onEventSelect]);

  // Fly to selected event; zoom back out when deselected
  useEffect(() => {
    if (!map.current) return;
    if (selectedEvent) {
      map.current.flyTo({
        center: [selectedEvent.location.lng, selectedEvent.location.lat],
        zoom: 10,
        duration: 1200,
      });
    } else {
      // Zoom back out to Tamil Nadu overview
      map.current.flyTo({
        center: [80.2707, 13.0827],
        zoom: 5.5,
        duration: 1000,
      });
    }
  }, [selectedEvent]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
