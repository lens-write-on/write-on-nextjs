const config = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,jsx,ts,tsx,css}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx,css}',
    './components/**/**/*.{js,jsx,ts,tsx,css}',
    './src/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  safelist: [
    "from-[#F08A24]", "to-[#E67E22]", "hover:from-[#E67E22]", "hover:to-[#D35400]",
    "from-[#F08A24]/50", "to-[#E67E22]/50", "from-[#F08A24]", "to-[#E67E22]",
    "from-[#D9BEA7]", "to-[#CAAF9B]", "md:hidden",
    // Add arbitrary width class to safelist
    "max-w-[460px]",
    // Add animation classes to safelist to ensure they're included in production
    "animate-in", "animate-out", "fade-in-0", "fade-out-0", "zoom-in-95", "zoom-out-95",
    "slide-in-from-left-1/2", "slide-in-from-top-[48%]", "slide-out-to-left-1/2", "slide-out-to-top-[48%]"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        // Add JavaBridge brown theme colors
        java: {
          "50": "#f5f0ec",
          "100": "#ebe0d9",
          "200": "#d7c2b3",
          "300": "#c3a38e",
          "400": "#af8568",
          "500": "#9b6642",
          "600": "#7c5235",
          "700": "#5d3d28",
          "800": "#3e291a",
          "900": "#1f140d"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "steam": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "50%": { transform: "translateY(-10px) scale(1.2)", opacity: "0.5" },
          "100%": { transform: "translateY(-20px) scale(0.8)", opacity: "0" }
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-15px) translateX(15px)" },
          "50%": { transform: "translateY(-25px) translateX(-10px)" },
          "75%": { transform: "translateY(-10px) translateX(15px)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Add keyframes for dialog animations
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
        "zoom-out": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(0.95)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-50%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "slide-out-to-top": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-50%)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "steam": "steam 2s ease-out infinite",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        "float": "float 15s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient": "gradientShift 8s ease infinite",
        // Add animations for dialog
        "fade-in": "fade-in 150ms ease",
        "fade-out": "fade-out 150ms ease",
        "zoom-in": "zoom-in 150ms ease",
        "zoom-out": "zoom-out 150ms ease",
        "slide-in-from-left": "slide-in-from-left 150ms ease",
        "slide-in-from-top": "slide-in-from-top 150ms ease",
        "slide-out-to-left": "slide-out-to-left 150ms ease",
        "slide-out-to-top": "slide-out-to-top 150ms ease",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

