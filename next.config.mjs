import withObfuscator from 'nextjs-obfuscator';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix peringatan Workspace Root
  experimental: {
    turbo: {
      root: '.', // Memaksa Turbopack melihat folder EliasDex sebagai root
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'thumbnail.komiku.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'files.catbox.moe' },
      { protocol: 'https', hostname: 'img.komiku.org' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  numbersToExpressions: true,
  simplify: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  splitStrings: true,
  unicodeEscapeSequence: true,
};

// Obfuscator hanya jalan kalau Webpack digunakan
export default withObfuscator(obfuscatorOptions)(nextConfig);