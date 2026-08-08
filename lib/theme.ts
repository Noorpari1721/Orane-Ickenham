export const theme = {
  colors: {
    primary: "#D4AF37",
    primaryLight: "#F5E6C8",
    primaryDark: "#D4AF37",

    background: "#0D0D0D",
    surface: "#161616",

    white: "#FFFFFF",

    text: {
      primary: "#FFFFFF",
      secondary: "rgba(255,255,255,0.75)",
      muted: "rgba(255,255,255,0.55)",
    },

    border: "rgba(255,255,255,0.10)",

    glass: "rgba(255,255,255,0.05)",

    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },

  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    full: "9999px",
  },

  spacing: {
    section: "120px",
    container: "80px",
  },

  shadow: {
    soft: "0 10px 30px rgba(0,0,0,.20)",

    luxury: "0 20px 60px rgba(0,0,0,.35)",

    glow: "0 0 30px rgba(212,175,55,.25)",
  },

  transition: {
    fast: "200ms ease",
    normal: "350ms ease",
    slow: "500ms ease",
  },

  navbar: {
    height: {
      top: 88,
      scrolled: 72,
    },
  },
} as const;
