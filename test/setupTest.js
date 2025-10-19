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

// Mock DOM methods
global.document = {
	getElementById: jest.fn(),
	querySelector: jest.fn(),
	querySelectorAll: jest.fn(),
	createElement: jest.fn(),
	addEventListener: jest.fn(),
};

// Mock window object
global.window = {
	alert: jest.fn(),
	console: {
		log: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
	},
};

// Mock localStorage
global.localStorage = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
};

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
