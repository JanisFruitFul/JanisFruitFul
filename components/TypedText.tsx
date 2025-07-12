"use client";

import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

const COLORS = [
  "text-emerald-600",
  "text-green-600",
  "text-emerald-500",
  "text-green-500",
  "text-emerald-600",
  "text-green-600",
  "text-emerald-500",
  "text-green-500",
  "text-emerald-600",
  "text-green-600",
  "text-emerald-500",
  "text-green-500",
  "text-emerald-600",
  "text-green-600",
];

interface TypedTextProps {
  text: string;
  className?: string;
  speed?: number;
  showCursor?: boolean;
}

export const TypedText: React.FC<TypedTextProps> = ({ 
  text, 
  className = "", 
  speed = 100,
  showCursor = true 
}) => {
  const el = useRef<HTMLSpanElement>(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    if (el.current) {
      // Clear any existing typed instance
      if (typed.current) {
        typed.current.destroy();
      }

      // Create colorful text by splitting into individual colored spans
      const colorfulText = text.split("").map((char, i) => {
        const color = COLORS[i % COLORS.length];
        return char === " " ? " " : `<span class="${color} font-bold drop-shadow-sm">${char}</span>`;
      }).join("");

      // Initialize Typed.js
      typed.current = new Typed(el.current, {
        strings: [colorfulText],
        typeSpeed: speed,
        showCursor: showCursor,
        cursorChar: '|',
        fadeOut: false,
        loop: false,
        onComplete: () => {
          // Optional: Add any completion callback
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (typed.current) {
        typed.current.destroy();
      }
    };
  }, [text, speed, showCursor]);

  return (
    <span 
      ref={el} 
      className={`inline-block font-extrabold ${className}`}
      style={{ lineHeight: 1.1 }}
    />
  );
}; 