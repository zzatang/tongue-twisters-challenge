// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tanstack/react-query', '@tanstack/query-core'],
  experimental: {
    swcPlugins: []
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: /node_modules\/@tanstack/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: ['@babel/plugin-transform-private-methods']
        }
      }
    })
    return config
  }
}

module.exports = nextConfig