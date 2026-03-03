/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          bg: "#F6F1E8",
          section: "#FBF7F2",
        },
        navy: {
          DEFAULT: "#0F2B46",
        },
        sky: {
          DEFAULT: "#CFE8F6",
        },
        blue: {
          interactive: "#5BA7D1",
        },
        border: {
          soft: "#E4E8ED",
        },
      },
      fontFamily: {
        display: ['"General Sans"', '"Satoshi"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        body: ["16px", { lineHeight: "1.75" }],
        "body-lg": ["18px", { lineHeight: "1.75" }],
      },
      spacing: {
        section: "120px",
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(15, 43, 70, 0.05), 0 1px 2px 0 rgba(15, 43, 70, 0.03)",
      },
    },
  },
  plugins: [],
};
