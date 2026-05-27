import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 25px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
