import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow both localhost and 127.0.0.1 during local/cloud preview
  // so HMR/websocket origin checks don't break the client bundle.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
