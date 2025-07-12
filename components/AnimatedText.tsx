import React from "react";

const COLORS = [
  "text-emerald-500",
  "text-yellow-500",
  "text-pink-500",
  "text-blue-500",
  "text-orange-500",
  "text-green-600",
  "text-purple-500",
  "text-red-500",
  "text-cyan-500",
  "text-fuchsia-500",
];

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = "" }) => {
  return (
    <span className={`inline-block font-extrabold ${className}`} style={{ lineHeight: 1.1 }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`inline-block transition-all duration-500 ease-out opacity-0 animate-fade-in-up ${COLORS[i % COLORS.length]}`}
          style={{
            animationDelay: `${i * 0.08 + 0.2}s`,
            animationFillMode: "forwards",
          }}
        >
          {char === " " ? <span className="w-2 inline-block" /> : char}
        </span>
      ))}
    </span>
  );
};

// Add the animation keyframes via a style tag (for Next.js/React)
if (typeof window !== "undefined") {
  const styleId = "animated-text-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fade-in-up 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
      }
    `;
    document.head.appendChild(style);
  }
} 