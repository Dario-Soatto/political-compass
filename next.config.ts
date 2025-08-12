import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove basePath and assetPrefix - we don't need them for this approach
  trailingSlash: true,
};

export default nextConfig;
