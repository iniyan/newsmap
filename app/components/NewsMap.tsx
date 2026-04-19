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
  news: NewsEvent[];
  selectedNews: NewsEvent | null;
  onNewsSelect: (news: NewsEvent) => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function NewsMap({ news, selectedNews, onNewsSelect, userLocation }: NewsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const initialFlownRef = useRef(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20, 30], // world-ish center — will fly to user location once known
      zoom: 2,
      projection: { name: 'globe' } as any,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // Atmosphere for globe
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(15, 15, 25)',
        'high-color': 'rgb(30, 30, 60)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(5, 5, 15)',
        'star-intensity': 0.6,
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Fly to user location once we have it (only once)
  useEffect(() => {
    if (!map.current || !userLocation || initialFlownRef.current) return;
    initialFlownRef.current = true;

    // Add blue user-location dot
    const el = document.createElement('div');
    el.style.cssText = `
      width: 14px; height: 14px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 0 0 4px rgba(59,130,246,0.3);
    `;
    userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current!);

    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 5,
      duration: 2000,
      essential: true,
    });
  }, [userLocation]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  useEffect(() => {
    if (!map.current) return;

    clearMarkers();

    news.forEach((item) => {
      const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;
      const size = 10 + Math.floor((item.intensity_score / 100) * 18);
      const isHot = item.intensity_score >= 70;

      const wrapper = document.createElement('div');
      wrapper.style.cssText = `
        width: ${size + 8}px;
        height: ${size + 8}px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      `;

      // Pulse ring for hot stories
      if (isHot) {
        const pulse = document.createElement('div');
        pulse.style.cssText = `
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color}33;
          animation: pulse-ring 1.8s ease-out infinite;
        `;
        wrapper.appendChild(pulse);
      }

      const dot = document.createElement('div');
      dot.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.85);
        box-shadow: 0 0 ${size}px ${color}77, 0 2px 8px rgba(0,0,0,0.5);
        transform-origin: center;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        position: relative;
        z-index: 1;
      `;

      wrapper.appendChild(dot);

      wrapper.addEventListener('mouseenter', () => {
        dot.style.transform = 'scale(1.5)';
        dot.style.boxShadow = `0 0 ${size * 2}px ${color}cc, 0 2px 12px rgba(0,0,0,0.6)`;
      });
      wrapper.addEventListener('mouseleave', () => {
        dot.style.transform = 'scale(1)';
        dot.style.boxShadow = `0 0 ${size}px ${color}77, 0 2px 8px rgba(0,0,0,0.5)`;
      });
      wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        onNewsSelect(item);
      });

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: 'center' })
        .setLngLat([item.location.lng, item.location.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [news, clearMarkers, onNewsSelect]);

  // Fly to selected news; zoom back when deselected
  useEffect(() => {
    if (!map.current) return;
    if (selectedNews) {
      map.current.flyTo({
        center: [selectedNews.location.lng, selectedNews.location.lat],
        zoom: 8,
        duration: 1200,
      });
    } else {
      // Zoom back to user location or world view
      if (userLocation) {
        map.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 4,
          duration: 1000,
        });
      } else {
        map.current.flyTo({ center: [20, 30], zoom: 2, duration: 1000 });
      }
    }
  }, [selectedNews, userLocation]);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.7); opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}
