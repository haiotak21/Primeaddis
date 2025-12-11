import { fileURLToPath } from "url";
import { dirname } from "path";
import createNextIntlPlugin from "next-intl/plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      // Leaflet marker icon fixes
      {
        source: "/properties/:id/marker-icon-2x.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      },
      {
        source: "/properties/:id/marker-icon.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      },
      {
        source: "/properties/:id/marker-shadow.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      },
      {
        source: "/properties/marker-icon-2x.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      },
      {
        source: "/properties/marker-icon.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      },
      {
        source: "/properties/marker-shadow.png",
        destination: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      },
    ];
  },

  // Remove this entire block — it's obsolete and breaks Turbopack
  // turbopack: {
  //   root: __dirname,
  // },
};

const withNextIntl = createNextIntlPlugin("./i18n.ts");

export default withNextIntl(nextConfig);