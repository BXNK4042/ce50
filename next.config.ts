import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['192.168.56.1'],
  async redirects() {
    return [
      {
        source: "/:lang(th|en)/teachers",
        destination: "/:lang/people/teachers",
        permanent: true,
      },
      {
        source: "/:lang(th|en)/teachers/:id",
        destination: "/:lang/people/teachers/:id",
        permanent: true,
      },
      {
        source: "/:lang(th|en)/students",
        destination: "/:lang/people/students",
        permanent: true,
      },
      {
        source: "/:lang(th|en)/students/:cohort",
        destination: "/:lang/people/students/:cohort",
        permanent: true,
      },
    ];
  },
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

