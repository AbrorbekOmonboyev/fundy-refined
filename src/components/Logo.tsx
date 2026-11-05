/**
 * The Fundy logo (files from the brand kit, in public/brand/).
 *   light          on white / light backgrounds (default; switches to `dark` in dark mode)
 *   dark           on ink or dark photos
 *   on-chartreuse  on chartreuse backgrounds
 * Brand rule: never narrower than 100 px for the horizontal logo, 24 px for the symbol.
 */
type Variant = 'light' | 'dark' | 'on-chartreuse';

function Pair({ kind, variant, className }: { kind: 'horizontal' | 'symbol'; variant: Variant; className: string }) {
  const src = (v: Variant) => `/brand/fundy-${kind}-${v}.svg`;
  const alt = kind === 'horizontal' ? 'Fundy' : '';
  if (variant !== 'light') return <img src={src(variant)} alt={alt} aria-hidden={!alt} className={className} />;
  return (
    <>
      <img src={src('light')} alt={alt} aria-hidden={!alt} className={`dark:hidden ${className}`} />
      <img src={src('dark')} alt={alt} aria-hidden={!alt} className={`hidden dark:block ${className}`} />
    </>
  );
}

export function Logo({ variant = 'light', className = 'h-8' }: { variant?: Variant; className?: string }) {
  return <Pair kind="horizontal" variant={variant} className={`w-auto min-w-[100px] ${className}`} />;
}

export function LogoSymbol({ variant = 'light', className = 'h-8' }: { variant?: Variant; className?: string }) {
  return <Pair kind="symbol" variant={variant} className={`w-auto min-w-6 ${className}`} />;
}
