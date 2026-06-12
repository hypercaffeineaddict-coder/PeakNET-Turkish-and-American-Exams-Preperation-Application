import { ComponentProps } from "react";

/**
 * PeakNET Logo – Modern twin-peak mountain mark with gradient.
 * Inspired by the brand's "reach the summit" philosophy.
 * Uses a stylized 'M/Λ' double-peak motif with a sparkle accent.
 */
export function Logo({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Background rounded square */}
      <rect
        width="40"
        height="40"
        rx="10"
        fill="url(#logo-bg)"
      />

      {/* Left peak */}
      <path
        d="M8 30L15.5 12L20 20"
        stroke="url(#peak-left)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right peak (taller / main) */}
      <path
        d="M17 30L24.5 8L32 30"
        stroke="url(#peak-right)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sparkle / star accent at the summit */}
      <circle cx="24.5" cy="7" r="1.8" fill="url(#sparkle)" />
      <path
        d="M24.5 3.5V5M24.5 9V10.5M21 7H22.5M26.5 7H28"
        stroke="url(#sparkle)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />

      <defs>
        {/* Dark gradient background */}
        <linearGradient id="logo-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a1035" />
          <stop offset="1" stopColor="#0f0a1e" />
        </linearGradient>

        {/* Left peak – violet to purple */}
        <linearGradient id="peak-left" x1="8" y1="30" x2="20" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" stopOpacity="0.6" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>

        {/* Right peak – blue to indigo */}
        <linearGradient id="peak-right" x1="17" y1="30" x2="32" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>

        {/* Sparkle glow */}
        <radialGradient id="sparkle" cx="0.5" cy="0.5" r="0.5" gradientUnits="objectBoundingBox">
          <stop stopColor="#e0d4ff" />
          <stop offset="1" stopColor="#a78bfa" />
        </radialGradient>
      </defs>
    </svg>
  );
}
