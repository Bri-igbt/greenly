/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "app-green": "#1b3022",
        "app-green-light": "#2d4a35",
        "app-green-lighter": "#3d6b4a",
        "app-orange": "#f97316",
        "app-orange-dark": "#ea580c",
        "app-cream": "#faf7f2",
        "app-cream-dark": "#f0ebe3",
        "app-text": "#1b3022",
        "app-text-light": "#6b7280",
        "app-border": "#e5e7eb",
        "app-success": "#22c55e",
        "app-error": "#ef4444",
        "app-warning": "#f59e0b",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      keyframes: {
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInRight: {
          from: {
            opacity: "0",
            transform: "translateX(100%)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        slideInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        pulseSoft: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
        "slide-in-up": "slideInUp 0.4s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};