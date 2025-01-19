import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        chestnut: {
          "50": "#fcf5f4",
          "100": "#fae8e6",
          "200": "#f6d5d2",
          "300": "#efb7b2",
          "400": "#e48d85",
          "500": "#d6675d",
          "600": "#c4544a",
          "700": "#a23c33",
          "800": "#86352e",
          "900": "#70322c",
          "950": "#3c1613",
        },
        "blue-chill": {
          "50": "#f2f9f9",
          "100": "#ddeff0",
          "200": "#bfe0e2",
          "300": "#92cace",
          "400": "#5faab1",
          "500": "#438e96",
          "600": "#3b757f",
          "700": "#356169",
          "800": "#325158",
          "900": "#2d464c",
          "950": "#1a2c32",
        },
        jade: {
          "50": "#effef7",
          "100": "#dafeef",
          "200": "#b8fadd",
          "300": "#81f4c3",
          "400": "#43e5a0",
          "500": "#1acd81",
          "600": "#0fa968",
          "700": "#108554",
          "800": "#126945",
          "900": "#11563a",
          "950": "#03301f",
        },
        "spring-wood": {
          "50": "#fbf9f6",
          "75": "#F7F3EC",
          "100": "#f2ece2",
          "200": "#e4d6c4",
          "300": "#d3bb9e",
          "400": "#c09b77",
          "500": "#b3845c",
          "600": "#a67250",
          "700": "#8a5b44",
          "800": "#704b3c",
          "900": "#5b3f33",
          "950": "#311f19",
        },
        "rose-of-sharon": {
          "50": "#fffbeb",
          "100": "#fef3c7",
          "200": "#fde58a",
          "300": "#fbd24e",
          "400": "#fabe25",
          "500": "#f49d0c",
          "600": "#d87607",
          "700": "#bc560a",
          "800": "#923f0e",
          "900": "#78340f",
          "950": "#451a03",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shine: {
          "0%": {
            backgroundPosition: "200% 0",
          },
          "25%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "-200% 0",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        shine: "shine 3s ease-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "dots-pattern": "radial-gradient(transparent 1px, white 1px)",
        "dots-pattern-dark": "radial-gradient(transparent 1px, rgb(0 0 0) 1px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
} satisfies Config;
