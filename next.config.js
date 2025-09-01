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
      // stary, pojedynczy endpoint -> nowy, mnogi
      {
        source: '/api/payment/test',
        destination: '/api/payments/test',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
