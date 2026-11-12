const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { registerServiceWorker } = require("./service_worker_registration");

const rootDir = path.resolve(__dirname, "../../");

function getServiceWorkerScripts(content) {
	const parsedDocument = new DOMParser().parseFromString(content, "text/html");
	const commentWalker = parsedDocument.createTreeWalker(parsedDocument, NodeFilter.SHOW_COMMENT);
	let swComment = commentWalker.nextNode();

	while (swComment && !swComment.textContent.toLowerCase().includes("service worker")) {
		swComment = commentWalker.nextNode();
	}

	if (!swComment) {
		return [];
	}

	const scripts = [];
	let node = swComment.nextSibling;
	while (
		node &&
		!(node.nodeType === Node.COMMENT_NODE && node.textContent.trim().toLowerCase().includes("custom scripts"))
	) {
		if (node instanceof HTMLScriptElement) {
			scripts.push(node);
		}
		node = node.nextSibling;
	}

	return scripts;
}

describe("registerServiceWorker", () => {
	it("returns null when navigatorInstance is undefined", async () => {
		const result = await registerServiceWorker("sw.js", { navigatorInstance: undefined });
		expect(result).toBeNull();
	});

	it("returns null when serviceWorker is not supported in navigatorInstance", async () => {
		const result = await registerServiceWorker("sw.js", {
			navigatorInstance: {},
		});
		expect(result).toBeNull();
	});

	it("registers immediately when document readyState is complete", async () => {
		const mockRegistration = { scope: "https://example.com/core/" };
		// Boundary: platform navigator.serviceWorker API omitted in the Node.js test environment.
		const mockRegister = jest.fn(() => Promise.resolve(mockRegistration));

		const mockNavigator = {
			serviceWorker: {
				register: mockRegister,
			},
		};

		const mockDocument = { readyState: "complete" };

		const result = await registerServiceWorker("custom-sw.js", {
			navigatorInstance: mockNavigator,
			documentInstance: mockDocument,
		});

		expect(mockRegister).toHaveBeenCalledWith("custom-sw.js");
		expect(result).toBe(mockRegistration);
	});

	it("defers registration until window load event when document is loading", async () => {
		const mockRegistration = { scope: "https://example.com/core/" };
		// Boundary: platform navigator.serviceWorker API omitted in the Node.js test environment.
		const mockRegister = jest.fn(() => Promise.resolve(mockRegistration));

		let loadListener;
		const mockWindow = {
			addEventListener: jest.fn((event, handler) => {
				if (event === "load") {
					loadListener = handler;
				}
			}),
		};

		const mockNavigator = {
			serviceWorker: {
				register: mockRegister,
			},
		};

		const mockDocument = { readyState: "loading" };

		const registrationPromise = registerServiceWorker("custom-sw.js", {
			navigatorInstance: mockNavigator,
			windowInstance: mockWindow,
			documentInstance: mockDocument,
		});

		expect(mockRegister).not.toHaveBeenCalled();
		expect(mockWindow.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));

		loadListener();
		const result = await registrationPromise;

		expect(mockRegister).toHaveBeenCalledWith("custom-sw.js");
		expect(result).toBe(mockRegistration);
	});

	it("catches registration rejections and logs a console warning without throwing", async () => {
		const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		const simulatedError = new TypeError(
			"Failed to register a ServiceWorker: An unknown error occurred when fetching the script.",
		);
		// Boundary: platform navigator.serviceWorker API omitted in the Node.js test environment.
		const mockRegister = jest.fn(() => Promise.reject(simulatedError));

		const mockNavigator = {
			serviceWorker: {
				register: mockRegister,
			},
		};

		const mockDocument = { readyState: "complete" };

		try {
			const result = await registerServiceWorker("custom-sw.js", {
				navigatorInstance: mockNavigator,
				documentInstance: mockDocument,
			});

			expect(result).toBeNull();
			expect(warnSpy).toHaveBeenCalledWith("Service worker registration failed:", simulatedError);
			expect(errorSpy).not.toHaveBeenCalled();
		} finally {
			warnSpy.mockRestore();
			errorSpy.mockRestore();
		}
	});
});

describe("registerServiceWorker legacy cleanup", () => {
	const origin = "https://scigrade.com";
	const legacyPrecache = `workbox-precache-v2-${origin}/core/scripts/serviceWorker/`;
	const rootPrecache = `workbox-precache-v2-${origin}/`;

	// Boundary: platform ServiceWorkerContainer and CacheStorage APIs are absent in jsdom.
	function createBrowser({ registrations, cacheNames }) {
		const rootRegistration = { scope: `${origin}/` };
		const cacheStorage = {
			keys: jest.fn(async () => cacheNames),
			delete: jest.fn(async () => true),
		};
		const navigatorInstance = {
			serviceWorker: {
				register: jest.fn(async () => rootRegistration),
				getRegistrations: jest.fn(async () => [rootRegistration, ...registrations]),
			},
		};
		return { rootRegistration, cacheStorage, navigatorInstance };
	}

	it("unregisters the legacy worker and deletes its precache, leaving root state untouched", async () => {
		const legacyRegistration = {
			scope: `${origin}/core/scripts/serviceWorker/`,
			unregister: jest.fn(async () => true),
		};
		const { rootRegistration, cacheStorage, navigatorInstance } = createBrowser({
			registrations: [legacyRegistration],
			cacheNames: [legacyPrecache, rootPrecache, "images", "html", "assets"],
		});
		rootRegistration.unregister = jest.fn();

		const result = await registerServiceWorker("/sw.js", {
			navigatorInstance,
			documentInstance: { readyState: "complete" },
			cacheStorageInstance: cacheStorage,
		});

		expect(result).toBe(rootRegistration);
		expect(navigatorInstance.serviceWorker.register).toHaveBeenCalledWith("/sw.js");
		expect(legacyRegistration.unregister).toHaveBeenCalledTimes(1);
		expect(rootRegistration.unregister).not.toHaveBeenCalled();
		expect(cacheStorage.delete).toHaveBeenCalledTimes(1);
		expect(cacheStorage.delete).toHaveBeenCalledWith(legacyPrecache);
	});

	it("deletes nothing when no legacy worker or cache exists", async () => {
		const { cacheStorage, navigatorInstance } = createBrowser({
			registrations: [],
			cacheNames: [rootPrecache, "images"],
		});

		await registerServiceWorker("/sw.js", {
			navigatorInstance,
			documentInstance: { readyState: "complete" },
			cacheStorageInstance: cacheStorage,
		});

		expect(cacheStorage.delete).not.toHaveBeenCalled();
	});

	it("still returns the new registration and warns when cleanup fails", async () => {
		const cleanupError = new Error("SecurityError");
		const { rootRegistration, cacheStorage, navigatorInstance } = createBrowser({
			registrations: [],
			cacheNames: [],
		});
		cacheStorage.keys.mockRejectedValue(cleanupError);
		const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

		try {
			const result = await registerServiceWorker("/sw.js", {
				navigatorInstance,
				documentInstance: { readyState: "complete" },
				cacheStorageInstance: cacheStorage,
			});

			expect(result).toBe(rootRegistration);
			expect(warnSpy).toHaveBeenCalledWith("Legacy service worker cleanup failed:", cleanupError);
		} finally {
			warnSpy.mockRestore();
		}
	});
});

describe("HTML Service Worker Script Configuration", () => {
	const htmlFiles = [
		{
			name: "index.html",
			path: path.resolve(rootDir, "index.html"),
			expectedScriptSrc: "core/scripts/service_worker_registration.js",
			expectedSwPath: "/sw.js",
		},
		{
			name: "core/systemrun.html",
			path: path.resolve(rootDir, "core/systemrun.html"),
			expectedScriptSrc: "scripts/service_worker_registration.js",
			expectedSwPath: "/sw.js",
		},
	];

	test.each(htmlFiles)(
		"$name loads the shared registration script via $expectedScriptSrc",
		({ path: filePath, expectedScriptSrc }) => {
			const content = fs.readFileSync(filePath, "utf8");
			const scripts = getServiceWorkerScripts(content);
			const loaderScript = scripts.find((script) => script.getAttribute("src") === expectedScriptSrc);
			expect(loaderScript).toBeDefined();
		},
	);

	test.each(htmlFiles)(
		'$name marks all service worker script tags with data-cfasync="false"',
		({ path: filePath }) => {
			const content = fs.readFileSync(filePath, "utf8");
			const scripts = getServiceWorkerScripts(content);
			expect(scripts.length).toBeGreaterThan(0);
			expect(scripts.every((script) => script.getAttribute("data-cfasync") === "false")).toBe(true);
		},
	);

	test.each(htmlFiles)(
		"$name calls window.registerServiceWorker with $expectedSwPath",
		({ path: filePath, expectedSwPath }) => {
			const content = fs.readFileSync(filePath, "utf8");
			const scripts = getServiceWorkerScripts(content);
			const inlineScript = scripts.find((script) => !script.getAttribute("src"));
			expect(inlineScript).toBeDefined();
			expect(inlineScript.textContent).toContain('typeof window.registerServiceWorker === "function"');
			expect(inlineScript.textContent).toContain(`window.registerServiceWorker("${expectedSwPath}")`);
		},
	);
});

describe("Workbox Configuration and Precache Artifacts", () => {
	const workboxConfigPath = path.resolve(rootDir, "workbox-config.cjs");
	const swJsPath = path.resolve(rootDir, "sw.js");

	it("configures globIgnores to exclude test and spec files", () => {
		const workboxConfig = require(workboxConfigPath);
		expect(workboxConfig.globIgnores).toContain("**/*.test.js");
		expect(workboxConfig.globIgnores).toContain("**/*.spec.js");
	});

	it("precaches service_worker_registration.js in sw.js", () => {
		const swContent = fs.readFileSync(swJsPath, "utf8");
		expect(swContent).toContain("/core/scripts/service_worker_registration.js");
	});

	it("writes the worker to the site root so its scope covers every page", () => {
		const workboxConfig = require(workboxConfigPath);
		expect(path.resolve(rootDir, workboxConfig.swDest)).toBe(swJsPath);
		expect(fs.existsSync(swJsPath)).toBe(true);
	});

	it("has a precache revision matching the current content of every precached file", () => {
		const swContent = fs.readFileSync(swJsPath, "utf8");
		const entries = [...swContent.matchAll(/url:"([^"]+)",revision:"([^"]+)"/g)];
		expect(entries.length).toBeGreaterThan(0);

		// Run `npm run workbox` after changing any file under core/ when this fails.
		const staleUrls = entries
			.filter(([, url, revision]) => {
				const filePath = path.join(rootDir, url);
				return (
					!fs.existsSync(filePath) ||
					crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex") !== revision
				);
			})
			.map(([, url]) => url);
		expect(staleUrls).toEqual([]);
	});

	it("does not precache any test or spec files in sw.js", () => {
		const swContent = fs.readFileSync(swJsPath, "utf8");
		expect(swContent).not.toMatch(/\/core\/.*\.test\.js/);
		expect(swContent).not.toMatch(/\/core\/.*\.spec\.js/);
	});
});
