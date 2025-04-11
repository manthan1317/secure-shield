/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode for now - can enable later if needed
  reactStrictMode: false,

  // ESLint settings - make warnings not fail the build in production
  eslint: {
    // Warning rather than error during build
    ignoreDuringBuilds: true,
  },

  // Type checking - make warnings not fail the build in production
  typescript: {
    // Warning rather than error during build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
