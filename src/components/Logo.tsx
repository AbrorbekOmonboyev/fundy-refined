/**
 * The Fundy logo (files from the brand kit, in public/brand/).
 *   light          on white / light backgrounds (default)
 *   dark           on ink or dark photos
 *   on-chartreuse  on chartreuse backgrounds
 * Brand rule: never narrower than 100 px for the horizontal logo, 24 px for the symbol.
 */
type Variant = 'light' | 'dark' | 'on-chartreuse';

export function Logo({ variant = 'light', className = 'h-8' }: { variant?: Variant; className?: string }) {
  return (
    <img src={`/brand/fundy-horizontal-${variant}.svg`} alt="Fundy" className={`w-auto min-w-[100px] ${className}`} />
  );
}

export function LogoSymbol({ variant = 'light', className = 'h-8' }: { variant?: Variant; className?: string }) {
  return (
    <img src={`/brand/fundy-symbol-${variant}.svg`} alt="" aria-hidden className={`w-auto min-w-6 ${className}`} />
  );
}
