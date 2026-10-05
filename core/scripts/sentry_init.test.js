const fs = require("node:fs");
const path = require("node:path");
const { initSentry } = require("./sentry_init");

const rootDir = path.resolve(__dirname, "../../");
const sentryInitPath = path.resolve(__dirname, "sentry_init.js");

function getSentryScripts(content) {
	const parsedDocument = new DOMParser().parseFromString(content, "text/html");
	const commentWalker = parsedDocument.createTreeWalker(parsedDocument, NodeFilter.SHOW_COMMENT);
	let sentryComment = commentWalker.nextNode();

	while (sentryComment && sentryComment.textContent.trim() !== "Sentry") {
		sentryComment = commentWalker.nextNode();
	}

	if (!sentryComment) {
		return [];
	}

	const scripts = [];
	let node = sentryComment.nextSibling;
	while (node && !(node.nodeType === Node.COMMENT_NODE && node.textContent.trim() === "Bootstrap")) {
		if (node instanceof HTMLScriptElement) {
			scripts.push(node);
		}
		node = node.nextSibling;
	}

	return scripts;
}

describe("sentry_init.js - initSentry", () => {
	let mockSentry;

	beforeEach(() => {
		mockSentry = {
			init: jest.fn(),
			captureConsoleIntegration: jest.fn(() => ({ name: "CaptureConsole" })),
			configureScope: jest.fn((callback) => {
				const mockScope = { setTag: jest.fn() };
				callback(mockScope);
			}),
			setTag: jest.fn(),
		};
	});

	test("returns false gracefully when sentryInstance is undefined", () => {
		expect(() => {
			const result = initSentry({ sentryInstance: undefined });
			expect(result).toBe(false);
		}).not.toThrow();
	});

	test("returns false gracefully when sentryInstance.init is not a function", () => {
		const invalidSentry = { init: null };
		expect(() => {
			const result = initSentry({ sentryInstance: invalidSentry });
			expect(result).toBe(false);
		}).not.toThrow();
	});

	test("handles undefined captureConsoleIntegration without throwing (Regression test for Sentry issue 7771953909)", () => {
		delete mockSentry.captureConsoleIntegration;

		expect(() => {
			const result = initSentry({
				sentryInstance: mockSentry,
				dsn: "https://example@ingest.us.sentry.io/123",
				release: "scigrade@1.2.0",
				appVersion: "1.2.0",
				enableLogs: true,
			});

			expect(result).toBe(true);
		}).not.toThrow();

		expect(mockSentry.init).toHaveBeenCalledTimes(1);
		expect(mockSentry.init).toHaveBeenCalledWith({
			dsn: "https://example@ingest.us.sentry.io/123",
			release: "scigrade@1.2.0",
			integrations: [],
			enableLogs: true,
		});
	});

	test("initializes with captureConsoleIntegration when function is present", () => {
		const result = initSentry({
			sentryInstance: mockSentry,
			dsn: "https://example@ingest.us.sentry.io/123",
			release: "scigrade@1.2.0",
			appVersion: "1.2.0",
			enableLogs: true,
		});

		expect(result).toBe(true);
		expect(mockSentry.captureConsoleIntegration).toHaveBeenCalledWith({
			levels: ["error"],
		});
		expect(mockSentry.init).toHaveBeenCalledWith({
			dsn: "https://example@ingest.us.sentry.io/123",
			release: "scigrade@1.2.0",
			integrations: [{ name: "CaptureConsole" }],
			enableLogs: true,
		});
	});

	test("configures app-version tag via configureScope when available", () => {
		let capturedScope;
		mockSentry.configureScope = jest.fn((callback) => {
			capturedScope = { setTag: jest.fn() };
			callback(capturedScope);
		});

		initSentry({
			sentryInstance: mockSentry,
			appVersion: "1.2.0",
		});

		expect(mockSentry.configureScope).toHaveBeenCalledTimes(1);
		expect(capturedScope.setTag).toHaveBeenCalledWith("app-version", "1.2.0");
	});

	test("configures app-version tag via Sentry.setTag fallback when configureScope is unavailable", () => {
		delete mockSentry.configureScope;

		initSentry({
			sentryInstance: mockSentry,
			appVersion: "1.2.0",
		});

		expect(mockSentry.setTag).toHaveBeenCalledWith("app-version", "1.2.0");
	});

	test("catches unexpected exceptions thrown during initialization and warns", () => {
		mockSentry.init = jest.fn(() => {
			throw new Error("SDK init failure");
		});

		expect(() => {
			const result = initSentry({ sentryInstance: mockSentry });
			expect(result).toBe(false);
		}).not.toThrow();

		expect(console.warn).toHaveBeenCalledWith("Failed to initialize Sentry:", expect.any(Error));
	});
});

describe("HTML Sentry Script Configuration", () => {
	const htmlFiles = [
		{ name: "index.html", path: path.resolve(rootDir, "index.html") },
		{ name: "core/systemrun.html", path: path.resolve(rootDir, "core/systemrun.html") },
	];

	test.each(htmlFiles)("$name does not include the conflicting Sentry JS loader script", ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		const parsedDocument = new DOMParser().parseFromString(content, "text/html");
		const sentryLoaderScripts = parsedDocument.querySelectorAll('script[src*="js.sentry-cdn.com"]');
		expect(sentryLoaderScripts).toHaveLength(0);
	});

	test.each(htmlFiles)('$name marks all Sentry script tags with data-cfasync="false"', ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		const scripts = getSentryScripts(content);
		expect(scripts.length).toBeGreaterThan(0);
		expect(scripts.every((script) => script.getAttribute("data-cfasync") === "false")).toBe(true);
	});

	test.each(htmlFiles)("$name locates all Sentry script tags regardless of tag-name casing", ({ path: filePath }) => {
		const content = fs
			.readFileSync(filePath, "utf8")
			.replaceAll("<script", "<SCRIPT")
			.replaceAll("</script>", "</SCRIPT>");

		const scripts = getSentryScripts(content);
		expect(scripts.length).toBeGreaterThan(0);
		expect(scripts.every((script) => script.getAttribute("data-cfasync") === "false")).toBe(true);
	});

	test.each(htmlFiles)("$name uses the correct Sentry ingest host", ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		const sentryScripts = getSentryScripts(content);
		const initializer = fs.readFileSync(sentryInitPath, "utf8");
		expect(sentryScripts.some((script) => script.getAttribute("src")?.endsWith("scripts/sentry_init.js"))).toBe(
			true,
		);
		expect(initializer).toContain("o1185775.ingest.us.sentry.io");
		expect(initializer).not.toContain("o1185775.ingest.io");
	});

	test.each(htmlFiles)("$name calls the shared Sentry initializer when it is available", ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		const scripts = getSentryScripts(content);
		expect(
			scripts.some(
				(script) =>
					script.textContent.includes('typeof window.initSentry === "function"') &&
					script.textContent.includes("window.initSentry();"),
			),
		).toBe(true);
	});
});
