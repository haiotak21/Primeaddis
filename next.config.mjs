import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Avoid Leaflet marker icon requests being handled by /properties/[id]
    return [
      {
        source: "/properties/:id/marker-icon-2x.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      },
      {
        source: "/properties/:id/marker-icon.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      },
      {
        source: "/properties/:id/marker-shadow.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      },
      // Also handle when requested from /properties root
      {
        source: "/properties/marker-icon-2x.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      },
      {
        source: "/properties/marker-icon.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      },
      {
        source: "/properties/marker-shadow.png",
        destination:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      },
    ];
  },
};

// Enable next-intl and point to our config file
const withNextIntl = createNextIntlPlugin("./i18n.ts");

export default withNextIntl(nextConfig);
