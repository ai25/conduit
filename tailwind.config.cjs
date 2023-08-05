/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "poppins": ["Poppins", "sans-serif"]
      }
    }
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [
     require("vidstack/tailwind.cjs"),
    require("tailwindcss-themer")({
      defaultTheme: {
        // put the default values of any config you want themed
        // just as if you were to extend tailwind's theme like normal https://tailwindcss.com/docs/theme#extending-the-default-theme
        extend: {
          // colors is used here for demonstration purposes
    colors: {
      bg1: "#111111",
      bg2: "#222222",
      bg3: "#333333",
      text1: "#f8f8f2",
      text2: "#d8d8c2",
      text3: "#272822",
      primary: "#f92672",
      secondary: "#a6e22e",
      accent1: "#faed27",
      accent2: "#66d9ef",
      highlight: "#f92672",
      navFooter: "#75715e",
    },
        },
      },
      themes: [
        {
  name: "dracula",
  extend: {
    colors: {
      bg1: "#181820",
      bg2: "#282a36",
      bg3: "#383a4a",
      text1: "#f8f8f2",
      text2: "#d8d8c2",
      text3: "#282a36",
      primary: "#bd93f9",
      secondary: "#50fa7b",
      accent1: "#ffb86c",
      accent2: "#ff79c6",
      highlight: "#bd93f9",
      navFooter: "#6272a4",
    },
  },
},
{
  name: "monokai",
  extend: {
    colors: {
      bg1: "#171712",
      bg2: "#272822",
      bg3: "#373832",
      text1: "#f8f8f2",
      text2: "#d8d8c2",
      text3: "#272822",
      primary: "#f92672",
      secondary: "#a6e22e",
      accent1: "#e6db74",
      accent2: "#66d9ef",
      highlight: "#f92672",
      navFooter: "#75715e",
    },
  },
},
{
  name: "github",
  extend: {
    colors: {
      bg1: "#f6f8fa",
      bg2: "#e6e8ea",
      bg3: "#e6e8ea",
      text1: "#24292e",
      text2: "#2c2c2e",
      text3: "#f6f8fa",
      primary: "#0366d6",
      secondary: "#6a737d",
      highlight: "#1066d6",
      accent1: "#d73a49",
      accent2: "#22863a",
      navFooter: "#959da5",
    },
  },
},
{
  name: "discord",
  extend: {
    colors: {
      bg1: "#26272f",
      bg2: "#36393f",
      bg3: "#464a4f",
      text1: "#ffffff",
      text2: "#d0d0d0",
      text3: "#36393f",
      primary: "#7289da",
      secondary: "#b9bbbe",
      accent1: "#f04747",
      accent2: "#43b581",
      highlight: "#7289da",
      navFooter: "#202225",
    },
  },
},
        {
          name: "kawaii",
          extend: {
            colors: {
              bg1: "#FFFFf2",
              bg2: "#FCBAD3",
              bg3: "#f5b8af",
              text1: "#26181a",
              text2: "#544245",
              text3: "#26181a",
              primary: 
              "#fe70a1",
              secondary: "#9BD1FF",
              accent1: "#AA96DA",
              accent2: "#9BD1FF",
              highlight: "#ffb3af",
              navFooter: "#FFCC99",
            },
          },
        },
      ],
    }),
  ]
};
