/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.IS_DOCKER ? 'standalone' : undefined,
  async redirects() {
    return [
      {
        source: '/apps',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
