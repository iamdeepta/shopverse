export function Stars({ rating, size = 'text-sm' }: { rating: number; size?: string }) {
  const full = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? 'text-amber-500' : 'text-[var(--line)]'}>
          ★
        </span>
      ))}
    </span>
  );
}
