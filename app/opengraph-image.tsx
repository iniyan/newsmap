import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#030712',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: 56,
            }}
          >
            N
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 80 }}>News</span>
            <span style={{ color: '#ef4444', fontWeight: 900, fontSize: 80 }}>Map</span>
          </div>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 36, margin: 0 }}>
          Tamil News, On the Map
        </p>
        <p style={{ color: '#4b5563', fontSize: 24, marginTop: 16 }}>
          BBC Tamil · Vikatan · Kalki · Puthiya Thalaimurai
        </p>
      </div>
    ),
    { ...size }
  );
}
