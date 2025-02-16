// postcss.config.mjs
export default {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.ts' // Explicitly point to TS config
    },
    autoprefixer: {},
  },
}