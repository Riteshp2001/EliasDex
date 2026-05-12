/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Mengizinkan semua hostname
      },
    ],
    domains: ['cdn.myanimelist.net', 'thumbnail.komiku.org', 'images.unsplash.com', 'myanimelist.net', 'files.catbox.moe', 'img.komiku.org', '**'], // jika gambar dari MAL
  },
};

export default nextConfig;