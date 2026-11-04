const SIZES = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' };

/** Profile picture, or the person's initials when there is none. */
export function Avatar({ name, url, size = 'md' }: { name: string; url: string | null; size?: keyof typeof SIZES }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || '?';

  return url ? (
    <img src={url} alt="" className={`${SIZES[size]} rounded-full object-cover bg-slate-100 shrink-0`} />
  ) : (
    <span
      aria-hidden
      className={`${SIZES[size]} rounded-full bg-brand text-ink font-semibold flex items-center justify-center shrink-0`}
    >
      {initials}
    </span>
  );
}
