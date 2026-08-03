/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable worker threads globally to prevent build OOM on this environment
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // Disable webpack cache if it causes local watch issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
