import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@m3000/hashed-gems"],
  allowedDevOrigins: ["192.168.0.133"]
};

export default nextConfig;
