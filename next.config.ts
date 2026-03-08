import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/demo',
        destination: 'https://admin.bizdive.kr/admin/demo',
        permanent: false,
      },
      {
        source: '/admin/demo/',
        destination: 'https://admin.bizdive.kr/admin/demo',
        permanent: false,
      },
      {
        source: '/admin/demo/:path*',
        destination: 'https://admin.bizdive.kr/admin/demo/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
