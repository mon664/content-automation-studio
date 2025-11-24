/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'i.ytimg.com',
      'img.youtube.com'
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    };
    return config;
  },
}

module.exports = nextConfig
