// PeakNET marka işareti — menekşe degrade tile üzerinde çift zirve + zirve düğümü
// (peak + network). Kendi arka planını taşır; sadece boyut className'i ver.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="PeakNET"
      fill="none"
    >
      <defs>
        <linearGradient id="pn-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.66 0.2 286)" />
          <stop offset="1" stopColor="oklch(0.5 0.21 283)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#pn-grad)" />
      {/* zirve düğümü */}
      <circle cx="12" cy="8" r="2.3" fill="#fff" />
      {/* çift zirve dağ silüeti */}
      <path
        d="M4.5 24.5 L12 12 L16.5 18.5 L20.5 13.5 L27.5 24.5 Z"
        fill="#fff"
      />
      {/* ikinci zirve düğümü (küçük) */}
      <circle cx="20.5" cy="10.5" r="1.5" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}
