/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
}

module.exports = nextConfig;
