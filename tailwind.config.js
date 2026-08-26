/** @type {import('tailwindcss').Config} */
import tailwindTypography from "@tailwindcss/typography";
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Flushing Tech brand palette (from flushingtech.org)
        site_orange: "#F29040",
        site_red: "#BB2828",
        site_navy: "#1E2A3A",
        peach: "#FFE4CE",
      },
      animation: {
        shimmer: "shimmer 4s linear forwards",
        "slide-down": "slide-down 0.3s ease-out",
        "border-spin": "border-spin 4s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-90% 0" },
        },
        "slide-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "border-spin": {
          "0%": { transform: "translate(-50%, -50%) rotate(0deg)" },
          "100%": { transform: "translate(-50%, -50%) rotate(360deg)" },
        },
      },
    },
  },
  plugins: [tailwindTypography],
};
