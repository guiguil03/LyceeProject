import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Vercel
  trailingSlash: false,
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
};

export default nextConfig;
