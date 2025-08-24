import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  env: {
    IP_ADDRESS: "10.131.144.142",
    PORT: "4000",
  },
  images: {
    domains: ["unitedway-uploads.s3.us-east-2.amazonaws.com"],
  },
};

export default nextConfig;
