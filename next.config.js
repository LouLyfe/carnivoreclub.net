/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        // Placeholder homepage imagery from Higgsfield's CDN — swap for
        // real farm/product photography per Brand Guidelines Section 6,
        // then this pattern can be removed.
        protocol: 'https',
        hostname: 'd8j0ntlcm91z4.cloudfront.net',
      },
    ],
  },
};

module.exports = nextConfig;
