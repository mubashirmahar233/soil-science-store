import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "deep-green": "#173F2B",
        "moss-green": "#24583D",
        earth-brown: "#705746",
        cream: "#F7F5F0",
        ink: "#17201B",
        muted: "#66716A",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
