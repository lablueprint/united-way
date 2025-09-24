import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  env: {
    IP_ADDRESS: "localhost",
    PORT: "4000",
  },
  images: {
    domains: ["unitedway-uploads.s3.us-east-2.amazonaws.com"],
  },
};

export default nextConfig;
