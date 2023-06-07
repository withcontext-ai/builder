/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/explore',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
