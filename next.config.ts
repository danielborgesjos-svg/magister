import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@whiskeysockets/baileys', 'jimp', 'sharp', 'qrcode', 'pino']
};

export default nextConfig;
