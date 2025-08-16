import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    IDK_MEDIA_URL: process.env.IDK_MEDIA_URL,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
