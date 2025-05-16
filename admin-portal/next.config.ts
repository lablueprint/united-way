import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["unitedway-uploads.s3.us-east-2.amazonaws.com"],
  },
  env: {
    IP_ADDRESS: "192.168.1.44",
    PORT: "4000",
  }
};

export default nextConfig;
