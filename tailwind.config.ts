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
        "quest-cream": "#FFF8E7",
        "quest-amber": "#D4A017",
        "quest-brown": "#5C3D11",
        "quest-dark": "#2C1A0E",
        "quest-gold": "#F0C040",
        "quest-parchment": "#F5E6C8",
        "quest-moss": "#4A7C59",
        "quest-red": "#8B2E2E",
      },
      fontFamily: {
        quest: ["var(--font-press-start)", "cursive"],
        body: ["var(--font-vt323)", "monospace"],
      },
      boxShadow: {
        "pixel-outer":
          "0 0 0 2px #F0C040, 0 0 0 4px #5C3D11, 0 0 0 6px #2C1A0E, 4px 4px 0 0 #1a0f08",
        "pixel-inset":
          "inset 2px 2px 0 #D4A017, inset -2px -2px 0 #2C1A0E, inset 0 0 0 1px #5C3D11",
        "pixel-nav-active":
          "inset 0 -3px 0 #B8860B, inset 2px 2px 0 #F5E6C8, inset -2px -2px 0 #5C3D11",
      },
    },
  },
  plugins: [],
};
export default config;
