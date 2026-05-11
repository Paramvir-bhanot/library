/** @type {import('next').NextConfig} */
const nextConfig = {  
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
      ],
      unoptimized: false,
      formats: ['image/avif', 'image/webp'],
      // Minimum cache time for optimized images
      minimumCacheTTL: 31536000, // 1 year
      // Disable static imports if needed
      disableStaticImages: false,
    },
    async headers() {
      return [
        {
          source: '/ads.txt',
          headers: [
            {
              key: 'Content-Type',
              value: 'text/plain; charset=utf-8',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=3600',
            },
          ],
        },
      ];
    },
  };

export default nextConfig;
