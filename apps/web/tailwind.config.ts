import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Font families
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        ui: ['var(--font-ui)', 'Syne', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'monospace'],
      },
      
      // Font sizes
      fontSize: {
        'display-xl': ['38px', '1.2'],
        'display-lg': ['26px', '1.3'],
        'display-md': ['20px', '1.3'],
        'display-sm': ['16px', '1.4'],
        'ui-lg': ['15px', '1.4'],
        'ui-md': ['14px', '1.5'],
        'ui-sm': ['13px', '1.5'],
        'ui-xs': ['11px', '1.4'],
        'mono-lg': ['15px', '1.4'],
        'mono-md': ['13px', '1.4'],
        'mono-sm': ['11px', '1.4'],
      },
      
      // Colors
      colors: {
        amber: {
          DEFAULT: '#B47500',
          hover: '#B07408',
        },
        success: {
          DEFAULT: '#16A34A',
          bg: '#DCFCE7',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEE2E2',
        },
        dark: '#1A1A1A',
        mid: '#555555',
        light: '#767676',
        lighter: '#CCCCCC',
        lightest: '#F5F5F5',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAFAFA',
        },
        sidebar: '#F0F0F0',
        border: '#E5E5E5',
      },
      
      // Spacing (extends defaults — keep 6=32px for app, add marketing values)
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '40': '160px',
      },
      
      // Border radius
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      
      // Border widths
      borderWidth: {
        'hairline': '0.5px',
      },
      
      // Shadows
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
