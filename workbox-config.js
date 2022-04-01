module.exports = {
  "globDirectory": "./core/",
  "globPatterns": [
    "**/*.{html,json,png,ico,jpg,svg,webmanifest,css,js,pdf,fasta,md,pdf,webp,xlsx,png,jpeg}"
  ],
  "swDest": "./core/scripts/serviceWorker/sw.js",
  "globIgnores": [
    'index.html',
    'workbox-config.js',
    'package.json',
    'package-lock.json'
  ],

  // Define runtime caching rules.
  "runtimeCaching": [{
    // Match any request that ends with .png, .jpg, .jpeg, .webp, .ico or .svg
    "urlPattern": /\.(?:png|jpg|jpeg|webp|ico|svg)$/,

    // Apply a cache-first strategy.
    "handler": 'CacheFirst',

    "options": {
      // Use a custom cache name.
      "cacheName": 'images',

      // Only cache 10 images.
      "expiration": {
        "maxEntries": 10,
      },
    },
  }],
};