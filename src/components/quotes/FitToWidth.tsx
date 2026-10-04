"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Shrinks fixed-width content (an A4 sheet is 794px) to fit its column,
 * keeping the exact print layout instead of reflowing it.
 */
export const FitToWidth: React.FC<{ contentWidth?: number; children: React.ReactNode }> = ({
  contentWidth = 794,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / contentWidth));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [contentWidth]);

  return (
    <div ref={ref} className="w-full min-w-0">
      <div style={{ zoom: scale }}>{children}</div>
    </div>
  );
};
