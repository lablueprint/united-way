import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //edward: "192.168.1.31"
  env: {
    IP_ADDRESS: "192.168.1.31",
    PORT: "4000",
  }
};

export default nextConfig;
