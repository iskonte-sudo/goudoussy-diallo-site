import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0E1B3C",
          light: "#152A5C"
        },
        red: {
          DEFAULT: "#CE1126",
          dark: "#A80E1F"
        },
        gold: "#E8B923",
        green: "#0F8A4F",
        offwhite: "#F5F6F8",
        ink: "#14171A",
        "ink-soft": "#5B6270",
        line: "#E6E7EA"
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        sans: ["var(--font-public-sans)", "sans-serif"]
      },
      borderRadius: {
        card: "8px"
      }
    }
  },
  plugins: []
};

export default config;
