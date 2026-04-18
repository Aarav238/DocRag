import { useTheme, type ThemeMode } from '../contexts/ThemeContext';

const options: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'system', label: 'System', icon: 'brightness_auto' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
];

interface ThemeToggleProps {
  variant?: 'segmented' | 'compact';
  className?: string;
}

/**
 * Theme control. `compact` matches app header chrome (settings / nav ghost buttons).
 * `segmented` is a pill group for layouts that need all three modes visible.
 */
export function ThemeToggle({ variant = 'segmented', className = '' }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  if (variant === 'compact') {
    const current = options.find((o) => o.value === mode) ?? options[1];
    const next = () => {
      const idx = options.findIndex((o) => o.value === mode);
      setMode(options[(idx + 1) % options.length].value);
    };
    return (
      <button
        type="button"
        onClick={next}
        title={`Theme: ${current.label} (click to cycle)`}
        aria-label={`Theme: ${current.label}. Click to change.`}
        className={[
          // Match Layout header settings button: same padding, radius, icon size, active scale
          'group inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl p-2.5',
          'text-neutral-400 transition-all duration-200 ease-out',
          'hover:bg-violet-50/90 hover:text-violet-600 hover:shadow-md hover:shadow-violet-500/[0.12]',
          'dark:text-on-surface-variant dark:hover:bg-violet-500/10 dark:hover:text-violet-300 dark:hover:shadow-black/25',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className="material-symbols-outlined block text-[20px] leading-none transition-transform duration-200 group-hover:scale-105"
          style={{
            fontVariationSettings: current.value === 'system' ? "'FILL' 0, 'wght' 500" : "'FILL' 1, 'wght' 500",
          }}
        >
          {current.icon}
        </span>
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={[
        'inline-flex items-center gap-0.5 rounded-full border border-neutral-200/70 bg-neutral-100/70 p-1 shadow-inner shadow-neutral-900/[0.03]',
        'dark:border-outline-variant dark:bg-surface-container-high/50 dark:shadow-black/20',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setMode(opt.value)}
            title={opt.label}
            className={[
              'flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200',
              active
                ? 'bg-white text-primary shadow-sm dark:bg-surface-container dark:text-primary'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            <span
              className="material-symbols-outlined text-[15px]"
              style={{
                fontVariationSettings: opt.value === 'system' ? "'FILL' 0" : "'FILL' 1",
              }}
            >
              {opt.icon}
            </span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
