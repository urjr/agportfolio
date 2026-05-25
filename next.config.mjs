/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable Webpack caching in development to prevent PackFileCacheStrategy desync errors
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
