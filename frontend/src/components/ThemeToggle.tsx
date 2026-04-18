import { useTheme, type ThemeMode } from '../contexts/ThemeContext';

const options: Array<{ value: ThemeMode; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'system', label: 'System', icon: 'desktop_windows' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
];

interface ThemeToggleProps {
  variant?: 'segmented' | 'compact';
  className?: string;
}

/**
 * Three-way theme toggle. `segmented` renders a labeled pill group;
 * `compact` renders a single icon that cycles through modes.
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
        onClick={next}
        title={`Theme: ${current.label} (click to cycle)`}
        aria-label={`Theme: ${current.label}. Click to change.`}
        className={`w-9 h-9 grid place-items-center rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer ${className}`}
      >
        <span className="material-symbols-outlined text-[20px]">{current.icon}</span>
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl border border-outline-variant bg-surface-container-low ${className}`}
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => setMode(opt.value)}
            title={opt.label}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              active
                ? 'bg-white dark:bg-surface-container-high text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{opt.icon}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
