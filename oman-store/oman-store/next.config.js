/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.aliexpress.com" },
      { protocol: "https", hostname: "**.temu.com" },
    ],
  },
};

module.exports = nextConfig;
