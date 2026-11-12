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
		"core/**/*.{html,json,png,ico,jpg,svg,webmanifest,css,js,pdf,webp,jpeg}"
	],
	"globIgnores": [
		"index.html",
		"workbox-config.cjs",
		"package.json",
		"package-lock.json",
		"node_modules/**/*",
		"**/*.test.js",
		"**/*.spec.js",
		// Files no page loads. Precaching them only adds to every visitor's first download.
		"core/scripts/APIandLibraries/Bootstrap/css/bootstrap-*",
		"core/scripts/APIandLibraries/Bootstrap/css/bootstrap.css",
		"core/scripts/APIandLibraries/Bootstrap/css/bootstrap.rtl*",
		"core/scripts/APIandLibraries/Bootstrap/js/bootstrap.bundle*",
		"core/scripts/APIandLibraries/Bootstrap/js/bootstrap.esm*",
		"core/scripts/APIandLibraries/Bootstrap/js/bootstrap.js",
		"core/scripts/APIandLibraries/tabletoCSV/{bower,package}.json",
		"core/scripts/APIandLibraries/tabletoCSV/{example.html,gulpfile.js}",
		"core/scripts/APIandLibraries/tabletoCSV/dist/**",
		"core/scripts/{runtime,crispr_scripts}.js",
		"core/styling/style.css",
		"core/images/EDITmd/**",
		"core/icon/resoc.png",
		"core/icon/screenshot*"
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
