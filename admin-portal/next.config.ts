import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  env: {
    IP_ADDRESS: "",
    PORT: "",
  },
};

export default nextConfig;
