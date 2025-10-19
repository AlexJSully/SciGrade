/**
 * Jest setup file for SciGrade project
 * This file sets up global mocks and utilities for testing
 */

// Mock fetch globally for tests
global.fetch = jest.fn();

// Mock jQuery globally
global.$ = jest.fn(() => ({
	click: jest.fn(),
	empty: jest.fn(),
	append: jest.fn(),
	ready: jest.fn(),
	val: jest.fn(),
	trim: jest.fn(),
}));

// Spy/mock only specific DOM methods as needed, preserving jsdom's native objects
if (typeof document !== "undefined") {
	jest.spyOn(document, "getElementById").mockImplementation(jest.fn());
	jest.spyOn(document, "querySelector").mockImplementation(jest.fn());
	jest.spyOn(document, "querySelectorAll").mockImplementation(jest.fn());
	jest.spyOn(document, "createElement").mockImplementation(jest.fn());
}

if (typeof window !== "undefined") {
	jest.spyOn(window, "alert").mockImplementation(jest.fn());
	jest.spyOn(window.console, "log").mockImplementation(jest.fn());
	jest.spyOn(window.console, "error").mockImplementation(jest.fn());
	jest.spyOn(window.console, "warn").mockImplementation(jest.fn());
}

if (typeof localStorage !== "undefined") {
	localStorage.getItem = jest.fn();
	localStorage.setItem = jest.fn();
	localStorage.removeItem = jest.fn();
	localStorage.clear = jest.fn();
}

// Helper function to create mock DOM elements
global.createMockElement = (id, value = "", innerHTML = "") => ({
	id,
	value,
	innerHTML,
	style: { display: "block" },
	setAttribute: jest.fn(),
	getAttribute: jest.fn(),
	removeAttribute: jest.fn(),
	addEventListener: jest.fn(),
	click: jest.fn(),
});

// Reset all mocks before each test
beforeEach(() => {
	jest.clearAllMocks();

	// Reset fetch mock
	if (fetch && fetch.mockClear) {
		fetch.mockClear();
	}

	// Reset jQuery mock
	if ($ && $.mockClear) {
		$.mockClear();
	}
});

// Helper function to create mock JSON responses
global.createMockJsonResponse = (data) => ({
	json: jest.fn().mockResolvedValue(data),
	ok: true,
	status: 200,
});

// Helper function to create mock fetch response
global.mockFetchResponse = (data) => {
	fetch.mockResolvedValue(createMockJsonResponse(data));
};
