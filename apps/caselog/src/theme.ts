/**
 * Caselog design tokens. Calm, credible, "legal-adjacent" palette — navy +
 * slate, restrained accents. Should feel trustworthy, not playful.
 */
export const colors = {
  bg: "#F4F6F9",
  surface: "#FFFFFF",
  primary: "#1B2A4A",
  primaryMuted: "#43536F",
  accent: "#2F6F6B",
  text: "#161B22",
  textMuted: "#5C6675",
  border: "#E1E5EB",
  success: "#2E7D5B",
  danger: "#B23B3B",
  // Incident category colors (keep in sync with types.ts IncidentCategory).
  category: {
    missed_exchange: "#B23B3B",
    late: "#C9772F",
    denied_visit: "#8E3B6B",
    hostile_comm: "#5A3FA0",
    safety: "#B2293B",
    expense: "#2F6F6B",
    other: "#5C6675",
  },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 20 };
export const font = { h1: 28, h2: 22, h3: 18, body: 16, small: 13 };
