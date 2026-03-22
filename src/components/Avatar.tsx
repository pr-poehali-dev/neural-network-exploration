import React from 'react';

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
  isOnline?: boolean;
  hasPartner?: boolean;
  className?: string;
}

const COLORS = [
  '#e17055', '#6c5ce7', '#00b894', '#0984e3', '#fd79a8', '#fdcb6e', '#55efc4', '#a29bfe',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ url, name, size = 40, isOnline, hasPartner, className = '' }: AvatarProps) {
  const letter = (name || '?')[0].toUpperCase();
  const dotSize = Math.max(10, size * 0.28);
  const dotOffset = Math.max(-2, size * -0.05);

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-semibold text-white w-full h-full"
          style={{ background: getColor(name), fontSize: size * 0.4 }}
        >
          {letter}
        </div>
      )}
      {isOnline && (
        <span
          className="absolute rounded-full border-2 bg-[--tnt-online]"
          style={{
            width: dotSize,
            height: dotSize,
            bottom: dotOffset,
            right: dotOffset,
            borderColor: 'var(--tnt-sidebar)',
          }}
        />
      )}
      {hasPartner && !isOnline && (
        <span
          className="absolute rounded-full flex items-center justify-center text-white"
          style={{
            width: dotSize + 2,
            height: dotSize + 2,
            bottom: dotOffset,
            right: dotOffset,
            fontSize: dotSize * 0.7,
            background: '#e91e63',
          }}
        >
          ♥
        </span>
      )}
    </div>
  );
}
