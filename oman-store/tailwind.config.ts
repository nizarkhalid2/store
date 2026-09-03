import type { Config } from "tailwindcss";

// Oman flag-inspired palette + subtle gold premium accent
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        oman: {
          red: "#C8102E",
          green: "#0B6E3A",
          white: "#FFFFFF",
          gold: "#C9A24B",
          ink: "#1A1A1A",
        },
      },
      fontFamily: {
        arabic: ["var(--font-tajawal)", "sans-serif"],
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
