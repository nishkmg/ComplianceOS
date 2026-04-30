import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Font families
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        ui: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        'ui-md': ['Syne', 'sans-serif'],
        'ui-sm': ['Syne', 'sans-serif'],
        'ui-xs': ['Syne', 'sans-serif'],
        'ui-lg': ['Syne', 'sans-serif'],
        'mono-md': ['DM Mono', 'monospace'],
        'mono-lg': ['DM Mono', 'monospace'],
        'marketing-hero': ['Playfair Display', 'serif'],
        'marketing-xl': ['Playfair Display', 'serif'],
        'display-xl': ['Playfair Display', 'serif'],
        'display-lg': ['Playfair Display', 'serif'],
      },
      
      // Font sizes
      fontSize: {
        'ui-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-xs': ['12px', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '500' }],
        'ui-lg': ['18px', { lineHeight: '1.5', fontWeight: '500' }],
        'mono-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'mono-lg': ['18px', { lineHeight: '1.4', fontWeight: '400' }],
        'marketing-hero': ['64px', { lineHeight: '1.1', fontWeight: '400' }],
        'marketing-xl': ['48px', { lineHeight: '1.15', fontWeight: '400' }],
        'display-xl': ['38px', { lineHeight: '1.2', fontWeight: '400' }],
        'display-lg': ['26px', { lineHeight: '1.3', fontWeight: '400' }],
      },
      
      // Colors
      colors: {
        primary: "#825500",
        "primary-container": "#c8860a",
        "on-surface": "#211b13",
        "on-surface-variant": "#514535",
        "border-subtle": "#E8E4DC",
        "page-bg": "#FAFAF8",
        "section-amber": "rgba(200, 134, 10, 0.06)",
        "section-dark": "#111111",
        "section-muted": "#F4F2EE",
        "amber-text": "#B47500",
        "text-light": "#888888",
        "text-mid": "#555555",
        "secondary": "#5f5e5e",
        outline: "#847563",
        amber: {
          DEFAULT: '#B47500',
          hover: '#B07408',
          stitch: '#825500',
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
      
      // Spacing
      spacing: {
        'space-48': '48px',
        'space-64': '64px',
        'space-96': '96px',
        'space-128': '128px',
        'gutter-desktop': '24px',
        'gutter-wide': '32px',
        'margin-mobile': '16px',
      },
      
      // Border radius
      borderRadius: {
        'DEFAULT': "0.125rem",
        'lg': "0.25rem",
        'xl': "0.5rem",
        'full': "0.75rem"
      },
      
      // Shadows
      boxShadow: {
        'screenshot': "0 20px 60px -15px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
