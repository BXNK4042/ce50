import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['192.168.56.1'],
  async rewrites() {
    return [
      {
        source: "/image/:path*",
        destination: `${backendUrl}/image/:path*`,
      },
      {
        source: "/professors/:path*",
        destination: `${backendUrl}/image/professors/:path*`,
      },
    ];
  },
};

export default nextConfig;

