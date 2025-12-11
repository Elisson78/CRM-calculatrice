/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd8f2ed535315c7d97df310dce5132399.cdn.bubble.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // CORS headers (ajustar origin em produção)
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowedOrigins = isProduction
      ? ['https://calculateur.moovelabs.com']
      : ['http://localhost:3000'];
    
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: isProduction ? 'https://calculateur.moovelabs.com' : '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  
  // Output standalone para Docker/deploy
  output: 'standalone',
};

module.exports = nextConfig;



