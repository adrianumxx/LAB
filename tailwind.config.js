/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  /* Il nostro `.container` vive in @layer base (globals.css); il plugin Tailwind è in components e lo sovrascriverebbe. */
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      colors: {
        // PRIMARY BRAND — emerald (allineato a --primary in globals)
        primary: {
          DEFAULT: 'var(--primary)',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // ACCENT — teal
        accent: {
          DEFAULT: 'var(--accent)',
          50: '#f0fdfa',
          100: '#ccfbf1',
          300: '#5eead4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        },
        landing: {
          ink: 'var(--landing-ink)',
          fg: 'var(--landing-fg)',
          muted: 'var(--landing-muted)',
        },
        // NEUTRAL
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // SEMANTIC
        success: {
          50: '#D1FAE5',
          600: '#059669',
          700: '#047857',
          900: '#065F46',
        },
        warning: {
          50: '#FEF3C7',
          600: '#D97706',
          700: '#B45309',
          900: '#92400E',
        },
        error: {
          50: '#FEE2E2',
          600: '#DC2626',
          700: '#B91C1C',
          900: '#991B1B',
        },
        info: {
          50: '#E0F2FE',
          600: '#0284C7',
          700: '#0369A1',
          900: '#075985',
        },
      },
      backgroundColor: {
        app: 'var(--bg-primary)',
        surface: 'var(--surface)',
        secondary: 'var(--bg-secondary)',
      },
      textColor: {
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
      },
      borderColor: {
        /* `border-border` / `divide-border` — token name matches design var */
        border: 'var(--border)',
        soft: 'var(--border)',
        strong: 'var(--border-strong)',
      },
      fontSize: {
        base: 'var(--tx-base)',
        lg: 'var(--tx-lg)',
        xl: 'var(--tx-xl)',
        '2xl': 'var(--tx-2xl)',
        '3xl': 'var(--tx-3xl)',
        '4xl': 'var(--tx-4xl)',
        hero: 'var(--tx-hero)',
        giant: 'var(--tx-giant)',
      },
      spacing: {
        1: 'var(--s1)',
        2: 'var(--s2)',
        3: 'var(--s3)',
        4: 'var(--s4)',
        6: 'var(--s6)',
        8: 'var(--s8)',
        10: 'var(--s10)',
        12: 'var(--s12)',
        16: 'var(--s16)',
        20: 'var(--s20)',
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
        cinematic: 'var(--dur-cinematic)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        ui: 'var(--font-ui)',
      },
    },
  },
  plugins: [],
}
