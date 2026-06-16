module.exports = {
	"swDest": "./core/scripts/serviceWorker/sw.js",
	"globDirectory": ".",
	// Precache URLs are made root-absolute so they resolve from the origin
	// root regardless of the service worker's own directory depth (the SW
	// lives at /core/scripts/serviceWorker/). Without this, the SW resolves
	// relative precache URLs against its own folder and 404s.
	"modifyURLPrefix": {
		"": "/"
	},
	"globPatterns": [
		"core/**/*.{html,json,png,ico,jpg,svg,webmanifest,css,js,pdf,fasta,md,pdf,webp,xlsx,png,jpeg}"
	],
	"globIgnores": [
		"index.html",
		"workbox-config.cjs",
		"package.json",
		"package-lock.json",
		"node_modules/**/*",
		"**/*.test.js"
	],
	"runtimeCaching": [
		{
			"urlPattern": /\.(?:png|jpg|jpeg|webp|ico|svg)$/,
			"handler": "CacheFirst",
			"options": {
				"cacheName": "images",
				"expiration": {
					"maxEntries": 10
				}
			}
		},
		{
			"urlPattern": /\.html$/,
			"handler": "NetworkFirst",
			"options": {
				"cacheName": "html",
				"networkTimeoutSeconds": 10,
				"expiration": {
					"maxEntries": 50
				},
				"cacheableResponse": {
					"statuses": [0, 200]
				}
			}
		},
		{
			"urlPattern": /\.(?:css|js)$/,
			"handler": "NetworkFirst",
			"options": {
				"cacheName": "assets",
				"expiration": {
					"maxEntries": 50
				},
				"cacheableResponse": {
					"statuses": [0, 200]
				}
			}
		}
	]
};
