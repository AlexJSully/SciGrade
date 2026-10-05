const fs = require("node:fs");
const path = require("node:path");
const { initSentry } = require("./sentry_init");

const rootDir = path.resolve(__dirname, "../../");

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
		expect(content).not.toContain("js.sentry-cdn.com");
	});

	test.each(htmlFiles)('$name marks all Sentry script tags with data-cfasync="false"', ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		const sentryBlock = content.match(/<!-- Sentry -->([\s\S]*?)<\/script>/);
		expect(sentryBlock).not.toBeNull();

		const scriptTags = sentryBlock[0].match(/<script\b[^>]*>/g) || [];
		expect(scriptTags.length).toBeGreaterThan(0);
		for (const tag of scriptTags) {
			expect(tag).toContain('data-cfasync="false"');
		}
	});

	test.each(htmlFiles)("$name uses the correct Sentry ingest host", ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		expect(content).toContain("o1185775.ingest.us.sentry.io");
		expect(content).not.toContain("o1185775.ingest.io");
	});

	test.each(htmlFiles)("$name guards Sentry.captureConsoleIntegration before calling it", ({ path: filePath }) => {
		const content = fs.readFileSync(filePath, "utf8");
		expect(content).toContain('typeof Sentry.captureConsoleIntegration === "function"');
	});
});
