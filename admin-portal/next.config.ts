import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  //edward: "192.168.1.31"
  env: {
    IP_ADDRESS: "",
    PORT: "",
  }
};

export default nextConfig;
