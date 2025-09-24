import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  },
  images: {
    domains: ["unitedway-uploads.s3.us-east-2.amazonaws.com"],
  },
};

export default nextConfig;
