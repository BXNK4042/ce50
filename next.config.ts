import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ['192.168.56.1', 'ce50.theyell.dev'],
  images: {
    unoptimized: true,
  },
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
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
      {
        source: "/Video/:path*",
        destination: `${backendUrl}/Video/:path*`,
      },
      {
        source: "/news/:path*",
        destination: `${backendUrl}/news/:path*`,
      },
      {
        source: "/:lang(th|en)/people/cohorts",
        destination: `${backendUrl}/people/cohorts`,
      },
      {
        source: "/people/:path*",
        destination: `${backendUrl}/people/:path*`,
      },
      {
        source: "/internship/:path*",
        destination: `${backendUrl}/internship/:path*`,
      },
      {
        source: "/rooms/:path*",
        destination: `${backendUrl}/rooms/:path*`,
      },
      {
        source: "/schedule/:path*",
        destination: `${backendUrl}/schedule/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${backendUrl}/users/:path*`,
      },
      {
        source: "/works/:path*",
        destination: `${backendUrl}/works/:path*`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;

