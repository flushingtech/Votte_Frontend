/** @type {import('tailwindcss').Config} */
import tailwindTypography from "@tailwindcss/typography";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        shimmer: "shimmer 4s linear forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-90% 0" },
        },
      },
    },
  },
  plugins: [tailwindTypography],
};
