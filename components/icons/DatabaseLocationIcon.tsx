export function DatabaseLocationIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {/* Database stack */}
      <ellipse cx="12" cy="6" rx="7" ry="3"/>
      <path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"/>
      <path d="M5 12v4c0 1.66 3.13 3 7 3s7-1.34 7-3v-4"/>
      
      {/* Location pin */}
      <circle cx="12" cy="20" r="2" fill="currentColor"/>
      <path d="M12 18v-2"/>
    </svg>
  );
}
