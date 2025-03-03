import withBundleAnalyzer from '@next/bundle-analyzer';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
initOpenNextCloudflareForDev();

// TODO cache-control headers don't work for static files
/** @type {import('next').NextConfig} */
const nextConfig = {
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://your-backend.com/:path*',
  //     },
  //   ]
  // },
  transpilePackages: ["@repo/ui"],
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**'
      }
    ]
  },
  experimental: {
    mdxRs: false,
    optimizePackageImports: ["@icons-pack/react-simple-icons", "@heroicons/react"],
    typedRoutes: false,
  },
};

// eslint-disable-next-line import/no-unused-modules
export default process.env.ANALYZE === 'true'
  // @ts-ignore
  ? withBundleAnalyzer()(nextConfig)
  : nextConfig;
