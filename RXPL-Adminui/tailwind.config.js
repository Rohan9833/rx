/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customGradientStart: "rgba(76, 0, 196, 0.5)", // Red with 80% opacity
        customGradientEnd: "rgba(240, 11, 81, 0.4)", // Blue with 40% opacity
        customGradientButtonStart: "rgba(76, 0, 196, 1)", // Red with 80% opacity
        customGradientButtonEnd: "rgba(240, 11, 81, 1)", // Blue with 40% opacity
        grayBlue: '#d90166', // Define your custom color
        gray1: '#f51b47', // Define your custom color
      },
      fontFamily: {
        custom: ['Octin', 'poppins'],
      },
    },
  },
  plugins: [],
};
