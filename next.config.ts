import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones on the local Wi-Fi load dev assets (e.g. http://192.168.54.92:3000).
  allowedDevOrigins: ["192.168.54.92", "192.168.*.*"],
};

export default nextConfig;
