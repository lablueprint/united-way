import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["unitedway-uploads.s3.us-east-2.amazonaws.com"],
  },
  env: {
    IP_ADDRESS: "",
    PORT: "4000",
  }
};

export default nextConfig;
