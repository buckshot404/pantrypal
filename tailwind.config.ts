import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        oat: "#F7F2EA",
        ink: "#172126",
        herb: "#3E7B59",
        citrus: "#F2B84B",
        coral: "#EE7A58",
        mist: "#E2E8DE"
      },
      boxShadow: {
        card: "0 18px 40px rgba(23, 33, 38, 0.08)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
