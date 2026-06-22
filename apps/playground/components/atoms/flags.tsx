export function FlagBr({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
      <rect width="20" height="14" fill="#009b3a" />
      <polygon points="10,1.2 18.5,7 10,12.8 1.5,7" fill="#fedf00" />
      <circle cx="10" cy="7" r="3.2" fill="#002776" />
    </svg>
  );
}

export function FlagUs({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
      <rect width="20" height="14" fill="#b22234" />
      <rect width="8" height="7.5" fill="#3c3b6e" />
      <path
        d="M0 1.2H20M0 3.6H20M0 6H20M0 8.4H20M0 10.8H20"
        stroke="#fff"
        strokeWidth="1.1"
      />
    </svg>
  );
}
