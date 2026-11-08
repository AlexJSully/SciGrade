//= ================================ SciGrade ==================================
//
// Purpose: Defensive registration helper for Service Worker lifecycle
//
// =============================================================================

/**
 * Registers a service worker script defensively and catches registration failures.
 *
 * Defers registration to the window load event to keep initial page rendering performant,
 * or registers immediately if the document has already finished loading. Any rejection
 * during script fetching or registration is caught and logged as a console warning to
 * prevent unhandled promise rejections.
 *
 * @param {string} [scriptPath="core/scripts/serviceWorker/sw.js"] - Relative or absolute path to the service worker script.
 * @param {object} [options={}] - Configuration options for service worker registration.
 * @param {Navigator} [options.navigatorInstance] - Browser navigator instance. Defaults to window.navigator in browser contexts.
 * @param {Window} [options.windowInstance] - Browser window instance. Defaults to window in browser contexts.
 * @param {Document} [options.documentInstance] - Browser document instance. Defaults to window.document in browser contexts.
 * @returns {Promise<ServiceWorkerRegistration|null>} A promise resolving to the registration on success, or null if registration was skipped or failed.
 */
function registerServiceWorker(
	scriptPath = "core/scripts/serviceWorker/sw.js",
	{
		navigatorInstance = typeof navigator !== "undefined" ? navigator : undefined,
		windowInstance = typeof window !== "undefined" ? window : undefined,
		documentInstance = typeof document !== "undefined" ? document : undefined,
	} = {},
) {
	if (!navigatorInstance || !("serviceWorker" in navigatorInstance)) {
		return Promise.resolve(null);
	}

	const executeRegistration = () =>
		navigatorInstance.serviceWorker.register(scriptPath).catch((err) => {
			if (typeof console !== "undefined" && typeof console.warn === "function") {
				console.warn("Service worker registration failed:", err);
			}

			return null;
		});

	if (documentInstance && documentInstance.readyState === "complete") {
		return executeRegistration();
	}

	if (windowInstance && typeof windowInstance.addEventListener === "function") {
		return new Promise((resolve) => {
			windowInstance.addEventListener("load", () => {
				resolve(executeRegistration());
			});
		});
	}

	return executeRegistration();
}

// Attach to window in browser contexts
if (typeof window !== "undefined") {
	window.registerServiceWorker = registerServiceWorker;
}

// Export for CommonJS test environments
if (typeof module !== "undefined" && module.exports) {
	module.exports = { registerServiceWorker };
}
