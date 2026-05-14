import createNextJsObfuscator from "nextjs-obfuscator";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: '.',
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
};

// Konfigurasi obfuscator sesuai API docs
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
  disableConsoleOutput: false, // Disarankan false oleh docs agar tidak break React
};

const pluginOptions = {
  enabled: "detect", // Otomatis aktif hanya saat build produksi
  log: true,
};

const withNextJsObfuscator = createNextJsObfuscator(obfuscatorOptions, pluginOptions);

export default withNextJsObfuscator(nextConfig);