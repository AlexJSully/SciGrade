module.exports = {
	"swDest": "./core/scripts/serviceWorker/sw.js",
	"globDirectory": ".",
	"globPatterns": [
		"core/**/*.{html,json,png,ico,jpg,svg,webmanifest,css,js,pdf,fasta,md,pdf,webp,xlsx,png,jpeg}"
	],
	"globIgnores": [
		"index.html",
		"workbox-config.cjs",
		"package.json",
		"package-lock.json",
		"node_modules/**/*"
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
