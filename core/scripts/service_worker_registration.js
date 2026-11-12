//= ================================ SciGrade ==================================
//
// Purpose: Defensive registration helper for Service Worker lifecycle
//
// =============================================================================

// Scope of the legacy worker at /core/scripts/serviceWorker/sw.js. That scope contains no
// page, so the legacy worker never updates itself and must be removed from a page.
const LEGACY_SERVICE_WORKER_SCOPE_PATH = "/core/scripts/serviceWorker/";

/**
 * Unregisters the legacy service worker and deletes the caches it created.
 *
 * Workbox names its precache `workbox-precache-v2-<registration scope>`, so every cache whose
 * name contains the legacy scope path belongs to the legacy worker.
 *
 * @param {ServiceWorkerContainer} serviceWorkerContainer - The navigator's service worker container.
 * @param {CacheStorage|undefined} cacheStorage - Cache Storage to clean, or undefined when unavailable.
 * @returns {Promise<void>} Resolves once the legacy registration and caches are removed.
 */
async function removeLegacyServiceWorker(serviceWorkerContainer, cacheStorage) {
	const registrations = await serviceWorkerContainer.getRegistrations();
	const legacyRegistrations = registrations.filter(
		(registration) => new URL(registration.scope).pathname === LEGACY_SERVICE_WORKER_SCOPE_PATH,
	);
	await Promise.all(legacyRegistrations.map((registration) => registration.unregister()));

	if (cacheStorage) {
		const cacheNames = await cacheStorage.keys();
		const legacyCacheNames = cacheNames.filter((name) => name.includes(LEGACY_SERVICE_WORKER_SCOPE_PATH));
		await Promise.all(legacyCacheNames.map((name) => cacheStorage.delete(name)));
	}
}

/**
 * Registers a service worker script defensively and catches registration failures.
 *
 * Defers registration to the window load event to keep initial page rendering performant,
 * or registers immediately if the document has already finished loading. Any rejection
 * during script fetching or registration is caught and logged as a console warning to
 * prevent unhandled promise rejections. The legacy worker and its caches are then removed
 * whether or not registration succeeded; a cleanup failure is logged as a warning and does
 * not affect the returned value.
 *
 * @param {string} [scriptPath="/sw.js"] - Relative or absolute path to the service worker script.
 * @param {object} [options={}] - Configuration options for service worker registration.
 * @param {Navigator} [options.navigatorInstance] - Browser navigator instance. Defaults to window.navigator in browser contexts.
 * @param {Window} [options.windowInstance] - Browser window instance. Defaults to window in browser contexts.
 * @param {Document} [options.documentInstance] - Browser document instance. Defaults to window.document in browser contexts.
 * @param {CacheStorage} [options.cacheStorageInstance] - Cache Storage used for legacy cleanup. Defaults to the global caches in browser contexts.
 * @returns {Promise<ServiceWorkerRegistration|null>} A promise resolving to the registration on success, or null if registration was skipped or failed.
 */
function registerServiceWorker(
	scriptPath = "/sw.js",
	{
		navigatorInstance = typeof navigator !== "undefined" ? navigator : undefined,
		windowInstance = typeof window !== "undefined" ? window : undefined,
		documentInstance = typeof document !== "undefined" ? document : undefined,
		cacheStorageInstance = typeof caches !== "undefined" ? caches : undefined,
	} = {},
) {
	if (!navigatorInstance || !("serviceWorker" in navigatorInstance)) {
		return Promise.resolve(null);
	}

	const executeRegistration = async () => {
		let registration = null;
		try {
			registration = await navigatorInstance.serviceWorker.register(scriptPath);
		} catch (err) {
			console.warn("Service worker registration failed:", err);
		}

		try {
			await removeLegacyServiceWorker(navigatorInstance.serviceWorker, cacheStorageInstance);
		} catch (err) {
			console.warn("Legacy service worker cleanup failed:", err);
		}

		return registration;
	};

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
