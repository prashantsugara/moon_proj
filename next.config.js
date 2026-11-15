/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
    outputFileTracingIncludes: {
      '/api/webhooks/whop': [
        './public/flags/*.png',
        './node_modules/@fontsource/noto-serif/files/noto-serif-latin-{400,700}-{normal,italic}.woff',
        './node_modules/@fontsource/noto-sans-mono/files/noto-sans-mono-latin-600-normal.woff',
      ],
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
