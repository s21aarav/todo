import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  allowedDevOrigins: ['10.52.162.113', 'http://10.52.162.113:3000'],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default withPWA(nextConfig);
