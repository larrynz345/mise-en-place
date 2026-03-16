import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080706",
        foreground: "#f0e8d8",
        brand: {
          dark: "#080706",
          gold: "#c8973a",
          cream: "#f0e8d8",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
