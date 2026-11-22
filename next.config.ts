import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
