interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 34 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="aw-shield-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3730A3" />
          <stop offset="55%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#aw-shield-grad)" />
      <path
        d="M20 8L29.5 11.6V19.4C29.5 25.5 25.4 29.8 20 32C14.6 29.8 10.5 25.5 10.5 19.4V11.6L20 8Z"
        fill="rgba(255,255,255,0.12)"
        stroke="#FFFFFF"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 20L18.7 23.2L24.8 16.8"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
