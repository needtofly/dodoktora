/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  reactStrictMode: true,

  async redirects() {
    return [
      // jeśli coś jeszcze odwoła się do starej trasy, przekierujemy na nową
      { source: '/api/admin/export', destination: '/api/admin/export-csv', permanent: true },
    ]
  },
}

module.exports = nextConfig
