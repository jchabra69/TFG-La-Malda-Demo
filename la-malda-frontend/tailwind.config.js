/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    screens: {
      mobile: "480px",
      tablet: "768px",
      desktop: "1024px",
      wide: "1440px"
    },
    extend: {
      colors: {
        white: "var(--white)",
        black: "var(--black)",
        "black-light": "var(--black-light)",
        red: "var(--red)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-light": "var(--text-light)"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        gutter: "var(--gutter)"
      },
      maxWidth: {
        container: "var(--container-max-width)",
        "container-wide": "var(--container-wide-width)"
      },
      height: {
        navbar: "var(--navbar-height)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        strong: "var(--shadow-strong)"
      }
    }
  }
};
