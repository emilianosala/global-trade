import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El upload de imágenes del admin permite hasta 5 MB; dejamos margen para
      // el overhead del multipart. El default de Server Actions es 1 MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
