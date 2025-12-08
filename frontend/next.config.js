/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: 'http://localhost:8000/api/agents/:path*',
      },
      {
        source: '/api/products',
        destination: 'http://localhost:8000/api/products',
      },
      {
        source: '/api/cart',
        destination: 'http://localhost:8000/api/cart',
      },
    ]
  },
}
