module.exports = {
	// The worker lives at the site root so its default scope ("/") covers every
	// page. A worker can only control pages at or below its own folder.
	"swDest": "./sw.js",
	"inlineWorkboxRuntime": true,
	"globDirectory": ".",
	// Precache URLs are root-absolute so they resolve from the origin root
	// regardless of where the worker file is served from.
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
		"**/*.test.js",
		"**/*.spec.js"
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
