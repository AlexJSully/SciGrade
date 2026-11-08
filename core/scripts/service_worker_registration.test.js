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

describe("HTML Service Worker Script Configuration", () => {
	const htmlFiles = [
		{
			name: "index.html",
			path: path.resolve(rootDir, "index.html"),
			expectedScriptSrc: "core/scripts/service_worker_registration.js",
			expectedSwPath: "core/scripts/serviceWorker/sw.js",
		},
		{
			name: "core/systemrun.html",
			path: path.resolve(rootDir, "core/systemrun.html"),
			expectedScriptSrc: "scripts/service_worker_registration.js",
			expectedSwPath: "./scripts/serviceWorker/sw.js",
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
	const swJsPath = path.resolve(rootDir, "core/scripts/serviceWorker/sw.js");

	it("configures globIgnores to exclude test and spec files", () => {
		const workboxConfig = require(workboxConfigPath);
		expect(workboxConfig.globIgnores).toContain("**/*.test.js");
		expect(workboxConfig.globIgnores).toContain("**/*.spec.js");
	});

	it("precaches service_worker_registration.js in sw.js", () => {
		const swContent = fs.readFileSync(swJsPath, "utf8");
		expect(swContent).toContain("/core/scripts/service_worker_registration.js");
	});

	it("does not precache any test or spec files in sw.js", () => {
		const swContent = fs.readFileSync(swJsPath, "utf8");
		expect(swContent).not.toMatch(/\/core\/.*\.test\.js/);
		expect(swContent).not.toMatch(/\/core\/.*\.spec\.js/);
	});
});
