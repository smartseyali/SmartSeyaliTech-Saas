import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs':  ['0.75rem',   { lineHeight: '1.1rem' }],   /* 12px */
        xs:     ['0.8125rem', { lineHeight: '1.2rem' }],   /* 13px */
        sm:     ['0.875rem',  { lineHeight: '1.3rem' }],   /* 14px */
        base:   ['0.9375rem', { lineHeight: '1.4rem' }],   /* 15px */
        md:     ['1rem',      { lineHeight: '1.5rem' }],   /* 16px */
        lg:     ['1.0625rem', { lineHeight: '1.6rem' }],   /* 17px */
        xl:     ['1.1875rem', { lineHeight: '1.7rem' }],   /* 19px */
        '2xl':  ['1.5rem',    { lineHeight: '2rem' }],     /* 24px */
        '3xl':  ['1.75rem',   { lineHeight: '2.25rem' }],  /* 28px */
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* Frappe gray ramp */
        gray: {
          0:   '#FFFFFF',
          50:  '#F9FAFA',
          100: '#F3F4F5',
          200: '#E2E6E9',
          300: '#C0C6CC',
          400: '#8D959D',
          500: '#68717B',
          600: '#4C5259',
          700: '#383D42',
          800: '#232629',
          900: '#1F272E',
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50:  '#F0F7FF',
          100: '#ECF5FF',
          200: '#CDE5FC',
          300: '#7AB8F5',
          400: '#4AA6F2',
          500: '#2490EF',
          600: '#1F7CCD',
          700: '#1868AC',
          800: '#12548B',
          900: '#0D3F6B',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          50:  '#FFF5F5',
          100: '#FFE9E9',
          500: '#E24C4C',
          700: '#A43B3B',
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          50:  '#F0FBF5',
          100: '#E4F5EC',
          500: '#29A56C',
          700: '#1F7A4E',
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          50:  '#FFFBEB',
          100: '#FFF5D4',
          500: '#F5A623',
          700: '#A5750F',
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          500: '#2490EF',
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          muted: "hsl(var(--sidebar-muted))",
        },
      },
      borderRadius: {
        none: '0',
        xs:  'var(--radius-xs)',        /* 3px */
        sm:  'var(--radius-sm)',        /* 4px */
        DEFAULT: 'var(--radius-md)',    /* 6px */
        md:  'var(--radius-md)',        /* 6px */
        lg:  'var(--radius-lg)',        /* 8px */
        xl:  'var(--radius-xl)',        /* 12px */
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
        none: 'none',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
        header: 'var(--header-height)',
        sidebar: 'var(--sidebar-width)',
        'sidebar-collapsed': 'var(--sidebar-width-collapsed)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-up": {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.18s ease-out",
        "accordion-up":   "accordion-up 0.18s ease-out",
        "fade-in":        "fade-in 0.22s ease-out",
        "slide-in-left":  "slide-in-left 0.22s ease-out",
        "slide-in-up":    "slide-in-up 0.28s ease-out",
        "scale-in":       "scale-in 0.18s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
