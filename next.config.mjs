// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // اگر خروجی استاتیک کامل می‌خواهی:
  // output: 'export',
};

export default nextConfig;
