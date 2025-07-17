/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'vusercontent.net'], // Asegúrate de que 'vusercontent.net' esté aquí
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig
