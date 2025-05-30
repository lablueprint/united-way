import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  reactStrictMode: false,
  env: {
    IP_ADDRESS: "192.168.0.209",
    PORT: "4000",
  }
};

export default nextConfig;
