'use client';

import { useEffect, useRef, useState } from 'react';

interface PanoramaViewerProps {
  imageUrl: string;
  title?: string;
}

export function PanoramaViewer({ imageUrl, title }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      setYaw((y) => y - dx * 0.15);
      setPitch((p) => Math.max(-45, Math.min(45, p + dy * 0.1)));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <section className="panorama-viewer madia-glass" aria-label={title || '360 panorama'}>
      <div
        ref={containerRef}
        className="panorama-stage"
        onMouseDown={(e) => {
          dragging.current = true;
          last.current = { x: e.clientX, y: e.clientY };
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (!t) return;
          dragging.current = true;
          last.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchMove={(e) => {
          if (!dragging.current) return;
          const t = e.touches[0];
          if (!t) return;
          const dx = t.clientX - last.current.x;
          const dy = t.clientY - last.current.y;
          last.current = { x: t.clientX, y: t.clientY };
          setYaw((y) => y - dx * 0.15);
          setPitch((p) => Math.max(-45, Math.min(45, p + dy * 0.1)));
        }}
        onTouchEnd={() => {
          dragging.current = false;
        }}
      >
        <div
          className="panorama-image"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)`,
          }}
          role="img"
          aria-label={title}
        />
      </div>
      <p className="panorama-hint">Drag to look around. Standard view — WebXR optional when supported.</p>
    </section>
  );
}
