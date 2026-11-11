/**
 * Basic form and feedback components, in the Redesign system (DESIGN.md):
 * green pill buttons, 16px inputs, one selected style.
 */
import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info, Loader2, TriangleAlert } from 'lucide-react';
import { usePageMeta } from '@/lib/usePageMeta';

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'link';
  loading?: boolean;
  fullWidth?: boolean;
};

// Green is the one action colour across Fundy; secondary is a quiet outline.
const BUTTON_STYLES = {
  primary: 'bg-brand text-white hover:bg-brand-deep active:bg-brand-deep',
  secondary: 'bg-card text-ink border border-slate-300 hover:border-ink hover:bg-slate-50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  link: 'text-ink hover:text-ink underline-offset-2 hover:underline px-0 py-0',
};

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
        variant === 'link' ? '' : 'min-h-11 px-5 py-2.5'
      } ${BUTTON_STYLES[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------
type FieldShellProps = { id: string; label: string; error?: string | null; hint?: string; children: ReactNode };

function FieldShell({ id, label, error, hint, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const INPUT_STYLES =
  'block w-full min-h-11 rounded-md border bg-card px-3.5 py-2.5 text-base text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand disabled:bg-slate-100';

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  error?: string | null;
  hint?: string;
};

export function TextField({ label, error, hint, type = 'text', className = '', ...rest }: TextFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${INPUT_STYLES} ${error ? 'border-rose-400' : 'border-slate-300'} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-700"
            aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  error?: string | null;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({ label, error, hint, options, placeholder, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${INPUT_STYLES} ${error ? 'border-rose-400' : 'border-slate-300'}`}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** A group of radio "cards". */
export function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: T | null;
  onChange: (value: T) => void;
  /** A disabled option stays visible (greyed out), so people can see what it needs. */
  options: { value: T; label: string; description?: string; disabled?: boolean }[];
  error?: string;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-medium text-slate-700 mb-1.5">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {options.map(o => (
          <label
            key={o.value}
            className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm transition-colors ${
              o.disabled
                ? 'border-slate-200 opacity-60 cursor-not-allowed'
                : value === o.value
                  ? 'border-ink bg-brand-soft cursor-pointer'
                  : 'border-slate-200 hover:border-slate-300 cursor-pointer'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="mt-0.5 accent-ink"
            />
            <span>
              <span className="block font-medium text-ink">{o.label}</span>
              {o.description && <span className="block text-xs text-slate-500 mt-0.5">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------
const ALERT_STYLES = {
  info: { box: 'bg-sky-50 border-sky-200 text-sky-900', Icon: Info },
  success: { box: 'bg-brand-soft border-brand text-ink', Icon: CheckCircle2 },
  warning: { box: 'bg-amber-50 border-amber-200 text-amber-900', Icon: TriangleAlert },
  error: { box: 'bg-rose-50 border-rose-200 text-rose-900', Icon: AlertCircle },
};

export function Alert({ variant = 'info', children }: { variant?: keyof typeof ALERT_STYLES; children: ReactNode }) {
  const { box, Icon } = ALERT_STYLES[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex gap-2.5 rounded-lg border p-3 text-sm ${box}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function PageSpinner() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center py-24" role="status">
      <Loader2 className="w-6 h-6 animate-spin text-ink" aria-hidden />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

/** Centered card used by the login / sign-up pages. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: ReactNode; children: ReactNode }) {
  usePageMeta(title);
  return (
    <section className="px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md bg-card rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// More fields
// ---------------------------------------------------------------------------
type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  error?: string | null;
  hint?: string;
  /** Show "120 / 200" under the box. */
  minChars?: number;
};

export function TextAreaField({ label, error, hint, minChars, value, rows = 4, ...rest }: TextAreaFieldProps) {
  const id = useId();
  const length = String(value ?? '').trim().length;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        aria-invalid={error ? true : undefined}
        className={`${INPUT_STYLES} ${error ? 'border-rose-400' : 'border-slate-300'}`}
        {...rest}
      />
      {minChars !== undefined && (
        <p className={`text-xs text-right ${length >= minChars ? 'text-ink' : 'text-slate-400'}`}>
          {length} / {minChars}
        </p>
      )}
    </FieldShell>
  );
}

/** Whole-number input (amounts in so'm, days, percentages). Empty → 0. */
export function NumberField({
  value,
  onValue,
  ...rest
}: Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & { value: number; onValue: (value: number) => void }) {
  return (
    <TextField
      {...rest}
      type="text"
      inputMode="decimal"
      value={value ? String(value) : ''}
      onChange={e => {
        const n = Number(e.target.value.replace(/[\s,]/g, ''));
        onValue(Number.isFinite(n) ? n : 0);
      }}
    />
  );
}
