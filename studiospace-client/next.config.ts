import type { NextConfig } from "next";

const API_URL = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    // Studio photos come from imgbb / postimages / Unsplash / Google avatars etc.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    // The browser only ever talks to its own origin (/server-api/*); Next forwards to Express.
    // That keeps the Express JWT cookie first-party (HTTPOnly + SameSite=Lax works on Vercel,
    // and is not blocked as a "third-party cookie").
    return [{ source: "/server-api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
