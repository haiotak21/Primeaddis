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
    // During local development Next's image optimizer can cause fetch/proxy
    // timeouts when external image hosts are slow or unreachable. Disable
    // optimization in non-production to avoid repeated _next/image 500s.
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        // Cloudinary serves images from `res.cloudinary.com/<cloud_name>/...`
        hostname: "res.cloudinary.com",
        port: "",
        // Restrict to the configured cloud name for safety
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
      {
        // Unsplash CDN images used in dev/content previews
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        // Some premium Unsplash images come from plus.unsplash.com
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
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
