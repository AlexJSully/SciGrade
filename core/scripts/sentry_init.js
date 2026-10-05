//= ================================ SciGrade ==================================
//
// Purpose: Defensive initialization helper for Sentry error tracking
//
// =============================================================================

/**
 * Initializes the Sentry browser SDK with defensive guards for missing objects
 * and optional integrations.
 *
 * @param {object} [options={}] - Configuration options for Sentry initialization.
 * @param {object|undefined} [options.sentryInstance] - Sentry SDK global instance. Defaults to window.Sentry if defined.
 * @param {string} [options.dsn="https://4661e72aaeb74d2fbd9e23b79e9506e0@o1185775.ingest.us.sentry.io/6600341"] - Sentry project ingestion DSN.
 * @param {string} [options.release="scigrade@1.2.0"] - Application release identifier.
 * @param {string} [options.appVersion="1.2.0"] - Application version tag for event scopes.
 * @param {boolean} [options.enableLogs=true] - Flag to enable or disable Sentry log ingestion.
 * @returns {boolean} True if Sentry was successfully initialized, false if Sentry is unavailable or an error occurred.
 */
function initSentry({
	sentryInstance = typeof window !== "undefined" ? window.Sentry : undefined,
	dsn = "https://4661e72aaeb74d2fbd9e23b79e9506e0@o1185775.ingest.us.sentry.io/6600341",
	// Keep these version values aligned with package.json.
	release = "scigrade@1.2.0",
	appVersion = "1.2.0",
	enableLogs = true,
} = {}) {
	try {
		if (!sentryInstance || typeof sentryInstance.init !== "function") {
			return false;
		}

		const integrations = [];
		if (typeof sentryInstance.captureConsoleIntegration === "function") {
			integrations.push(
				sentryInstance.captureConsoleIntegration({
					levels: ["error"],
				}),
			);
		}

		sentryInstance.init({
			dsn,
			release,
			integrations,
			// Enable logs to be sent to Sentry.
			enableLogs,
		});

		if (typeof sentryInstance.configureScope === "function") {
			sentryInstance.configureScope((scope) => {
				if (scope && typeof scope.setTag === "function") {
					scope.setTag("app-version", appVersion);
				}
			});
		} else if (typeof sentryInstance.setTag === "function") {
			sentryInstance.setTag("app-version", appVersion);
		}

		return true;
	} catch (err) {
		if (typeof console !== "undefined" && typeof console.warn === "function") {
			console.warn("Failed to initialize Sentry:", err);
		}

		return false;
	}
}

// Attach to window in browser contexts
if (typeof window !== "undefined") {
	window.initSentry = initSentry;
}

// Export for CommonJS test environments
if (typeof module !== "undefined" && module.exports) {
	module.exports = { initSentry };
}
