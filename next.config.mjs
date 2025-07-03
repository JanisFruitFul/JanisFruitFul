/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Resolve Node.js module issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "util-deprecate": false,
      "punycode": false,
      "url": false,
      "querystring": false,
      "path": false,
      "fs": false,
      "net": false,
      "tls": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "process": false,
    };

    // Suppress deprecation warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /the `punycode` module is deprecated/,
      /Critical dependency/,
    ];

    // Add externals for problematic modules
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'util-deprecate': 'commonjs util-deprecate',
      });
    }

    return config;
  },
}

export default nextConfig
