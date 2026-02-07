import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          // X-Frame-Options - Prevents clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY", // or "SAMEORIGIN" if you need iframes from same domain
          },
          // X-XSS-Protection - Legacy XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // X-Content-Type-Options - Prevents MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer-Policy - Controls referrer info
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Content-Security-Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://clerk.com https://*.clerk.accounts.dev https://*.akrout.dev",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.clerk.com https://img.clerk.com https://*.akrout.dev",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.akrout.dev https://generativelanguage.googleapis.com",
              "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.akrout.dev",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Permissions-Policy - Controls browser features   
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // CORS headers for API routes only
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;