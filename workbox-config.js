module.exports = {
	"swDest": "./core/scripts/serviceWorker/sw.js",
	"globDirectory": ".",
	"globPatterns": [
		"core/**/*.{html,json,png,ico,jpg,svg,webmanifest,css,js,pdf,fasta,md,pdf,webp,xlsx,png,jpeg}"
	],
	"globIgnores": [
		'index.html',
		'workbox-config.js',
		'package.json',
		'package-lock.json',
		'node_modules/**/*',
	],
	// Define runtime caching rules.
	"runtimeCaching": [
		{
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
		},
		{
			// Match HTML files for offline support
			"urlPattern": /\.html$/,
			// Apply a network-first strategy.
			"handler": 'NetworkFirst',
			"options": {
				// Use a custom cache name.
				"cacheName": 'html',
				// Configure fallback for offline usage
				"networkTimeoutSeconds": 10,
				"expiration": {
					"maxEntries": 50,
				},
				"cacheableResponse": {
					"statuses": [0, 200],
				},
			},
		},
		{
			// Match CSS and JS files for offline support
			"urlPattern": /\.(?:css|js)$/,
			// Apply a network-first strategy.
			"handler": 'NetworkFirst',
			"options": {
				// Use a custom cache name.
				"cacheName": 'assets',
				"expiration": {
					"maxEntries": 50,
				},
				"cacheableResponse": {
					"statuses": [0, 200],
				},
			},
		}
	],
};