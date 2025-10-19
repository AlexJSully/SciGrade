/**
 * Unit tests for login.js
 * Tests isolated utility functions and logic
 */

describe("login.js - Utility Functions", () => {
	// Test the checkStudentNumber function logic
	describe("checkStudentNumber()", () => {
		const validateStudentNumber = (studentNumber) => {
			const studentNumberStr = String(studentNumber);
			return (
				studentNumberStr.length === 6 &&
				/^\d+$/.test(studentNumberStr) &&
				studentNumber > 100000 &&
				studentNumber <= 999999
			);
		};

		it("should return true for valid 6-digit student numbers", () => {
			expect(validateStudentNumber(123456)).toBe(true);
			expect(validateStudentNumber(999999)).toBe(true);
			expect(validateStudentNumber(500000)).toBe(true);
		});

		it("should return false for numbers with less than 6 digits", () => {
			expect(validateStudentNumber(12345)).toBe(false);
			expect(validateStudentNumber(999)).toBe(false);
			expect(validateStudentNumber(1)).toBe(false);
		});

		it("should return false for numbers with more than 6 digits", () => {
			expect(validateStudentNumber(1234567)).toBe(false);
			expect(validateStudentNumber(12345678)).toBe(false);
		});

		it("should return false for edge cases", () => {
			expect(validateStudentNumber(100000)).toBe(false); // Too low
			expect(validateStudentNumber(1000000)).toBe(false); // Too high
			expect(validateStudentNumber(0)).toBe(false);
		});

		it("should handle string inputs", () => {
			expect(validateStudentNumber("123456")).toBe(true);
			expect(validateStudentNumber("999999")).toBe(true);
			expect(validateStudentNumber("abc123")).toBe(false);
			expect(validateStudentNumber("12345a")).toBe(false);
		});
	});

	// Test login verification logic
	describe("loginVerify() logic", () => {
		const verifyLogin = (studentNumber, password, correctPassword) => {
			const isValidStudentNumber =
				String(studentNumber).length === 6 &&
				/^\d+$/.test(String(studentNumber)) &&
				studentNumber > 100000 &&
				studentNumber <= 999999;

			const isValidPassword = password === correctPassword;

			return {
				isValid: isValidStudentNumber && isValidPassword,
				hasValidStudentNumber: isValidStudentNumber,
				hasValidPassword: isValidPassword,
			};
		};

		it("should return true for valid credentials", () => {
			const result = verifyLogin(123456, "correct", "correct");
			expect(result.isValid).toBe(true);
			expect(result.hasValidStudentNumber).toBe(true);
			expect(result.hasValidPassword).toBe(true);
		});

		it("should return false for invalid student number", () => {
			const result = verifyLogin(12345, "correct", "correct");
			expect(result.isValid).toBe(false);
			expect(result.hasValidStudentNumber).toBe(false);
			expect(result.hasValidPassword).toBe(true);
		});

		it("should return false for invalid password", () => {
			const result = verifyLogin(123456, "wrong", "correct");
			expect(result.isValid).toBe(false);
			expect(result.hasValidStudentNumber).toBe(true);
			expect(result.hasValidPassword).toBe(false);
		});

		it("should return false for both invalid", () => {
			const result = verifyLogin(12345, "wrong", "correct");
			expect(result.isValid).toBe(false);
			expect(result.hasValidStudentNumber).toBe(false);
			expect(result.hasValidPassword).toBe(false);
		});
	});

	// Test error display logic
	describe("showRegError() logic", () => {
		const getErrorMessage = (studentNumberValid, passwordValid) => {
			if (!studentNumberValid && !passwordValid) {
				return "Student number and password are both incorrect";
			} else if (!studentNumberValid) {
				return "Student number is not valid";
			} else if (!passwordValid) {
				return "Password is incorrect";
			}
			return "";
		};

		it("should return error for invalid student number only", () => {
			const message = getErrorMessage(false, true);
			expect(message).toBe("Student number is not valid");
		});

		it("should return error for invalid password only", () => {
			const message = getErrorMessage(true, false);
			expect(message).toBe("Password is incorrect");
		});

		it("should return error for both invalid", () => {
			const message = getErrorMessage(false, false);
			expect(message).toBe("Student number and password are both incorrect");
		});

		it("should return empty string for valid inputs", () => {
			const message = getErrorMessage(true, true);
			expect(message).toBe("");
		});
	});

	// Test gene content loading logic
	describe("loadGeneContent() logic", () => {
		const generateGeneInfo = (gene, backgroundInfo) => {
			const info = {
				geneName: gene,
				hasBackgroundInfo: false,
				hasSequenceFile: false,
				targetPosition: 0,
				description: "",
			};

			if (backgroundInfo && backgroundInfo.gene_list && backgroundInfo.gene_list[gene]) {
				info.hasBackgroundInfo = true;
				const geneData = backgroundInfo.gene_list[gene];

				if (geneData["Target position"]) {
					info.targetPosition = geneData["Target position"];
				}

				if (geneData.Description) {
					info.description = geneData.Description;
				}
			}

			// Check if sequence file would exist (simulation)
			const validGenes = ["ACTN3", "APOE", "CCR5", "eBFP", "HBB"];
			if (validGenes.includes(gene)) {
				info.hasSequenceFile = true;
			}

			return info;
		};

		it("should generate correct info for valid gene with background", () => {
			const backgroundInfo = {
				gene_list: {
					ACTN3: {
						"Target position": 1858,
						Description: "Alpha-actinin-3",
					},
				},
			};

			const result = generateGeneInfo("ACTN3", backgroundInfo);
			expect(result.geneName).toBe("ACTN3");
			expect(result.hasBackgroundInfo).toBe(true);
			expect(result.hasSequenceFile).toBe(true);
			expect(result.targetPosition).toBe(1858);
			expect(result.description).toBe("Alpha-actinin-3");
		});

		it("should handle gene without background info", () => {
			const result = generateGeneInfo("UNKNOWN", null);
			expect(result.geneName).toBe("UNKNOWN");
			expect(result.hasBackgroundInfo).toBe(false);
			expect(result.hasSequenceFile).toBe(false);
			expect(result.targetPosition).toBe(0);
			expect(result.description).toBe("");
		});

		it("should handle valid gene without sequence file", () => {
			const backgroundInfo = {
				gene_list: {
					TESTGENE: {
						"Target position": 500,
						Description: "Test gene",
					},
				},
			};

			const result = generateGeneInfo("TESTGENE", backgroundInfo);
			expect(result.geneName).toBe("TESTGENE");
			expect(result.hasBackgroundInfo).toBe(true);
			expect(result.hasSequenceFile).toBe(false);
			expect(result.targetPosition).toBe(500);
		});
	});

	// Test redirect functionality
	describe("redirectCRISPR() logic", () => {
		const generateRedirectURL = (gene, studentNumber) => {
			if (!gene || !studentNumber) {
				return null;
			}

			const validStudentNumber =
				String(studentNumber).length === 6 &&
				/^\d+$/.test(String(studentNumber)) &&
				studentNumber > 100000 &&
				studentNumber <= 999999;

			if (!validStudentNumber) {
				return null;
			}

			return `core/systemrun.html?gene=${encodeURIComponent(gene)}&student=${studentNumber}`;
		};

		it("should generate correct URL for valid inputs", () => {
			const url = generateRedirectURL("ACTN3", 123456);
			expect(url).toBe("core/systemrun.html?gene=ACTN3&student=123456");
		});

		it("should handle special characters in gene name", () => {
			const url = generateRedirectURL("e BFP", 123456);
			expect(url).toBe("core/systemrun.html?gene=e%20BFP&student=123456");
		});

		it("should return null for invalid student number", () => {
			const url = generateRedirectURL("ACTN3", 12345);
			expect(url).toBe(null);
		});

		it("should return null for missing gene", () => {
			const url = generateRedirectURL("", 123456);
			expect(url).toBe(null);
		});

		it("should return null for missing student number", () => {
			const url = generateRedirectURL("ACTN3", "");
			expect(url).toBe(null);
		});
	});

	// Test session management logic
	describe("Session management logic", () => {
		const createSessionData = (studentNumber, gene) => {
			const sessionData = {
				studentNumber: studentNumber,
				selectedGene: gene,
				loginTime: new Date().toISOString(),
				isActive: true,
			};

			return sessionData;
		};

		const validateSession = (sessionData) => {
			if (!sessionData) return false;

			const requiredFields = ["studentNumber", "selectedGene", "loginTime"];
			return requiredFields.every((field) => sessionData.hasOwnProperty(field));
		};

		it("should create valid session data", () => {
			const session = createSessionData(123456, "ACTN3");
			expect(session.studentNumber).toBe(123456);
			expect(session.selectedGene).toBe("ACTN3");
			expect(session.isActive).toBe(true);
			expect(session.loginTime).toBeDefined();
		});

		it("should validate complete session data", () => {
			const session = {
				studentNumber: 123456,
				selectedGene: "ACTN3",
				loginTime: "2023-01-01T00:00:00.000Z",
			};

			expect(validateSession(session)).toBe(true);
		});

		it("should reject incomplete session data", () => {
			const session = {
				studentNumber: 123456,
				// missing selectedGene and loginTime
			};

			expect(validateSession(session)).toBe(false);
		});

		it("should reject null session data", () => {
			expect(validateSession(null)).toBe(false);
		});
	});

	// Test form validation logic
	describe("Form validation logic", () => {
		const validateLoginForm = (formData) => {
			const errors = [];
			const { studentNumber, password } = formData;

			// Validate student number
			if (!studentNumber) {
				errors.push("Student number is required");
			} else {
				const studentNumberStr = String(studentNumber);
				if (studentNumberStr.length !== 6) {
					errors.push("Student number must be 6 digits");
				} else if (!/^\d+$/.test(studentNumberStr)) {
					errors.push("Student number must contain only numbers");
				} else if (studentNumber <= 100000 || studentNumber > 999999) {
					errors.push("Student number must be between 100001 and 999999");
				}
			}

			// Validate password
			if (!password) {
				errors.push("Password is required");
			} else if (password.length < 1) {
				errors.push("Password cannot be empty");
			}

			return {
				isValid: errors.length === 0,
				errors: errors,
			};
		};

		it("should validate complete form data", () => {
			const formData = {
				studentNumber: 123456,
				password: "testpass",
			};

			const result = validateLoginForm(formData);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("should reject form with missing student number", () => {
			const formData = {
				password: "testpass",
			};

			const result = validateLoginForm(formData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Student number is required");
		});

		it("should reject form with invalid student number", () => {
			const formData = {
				studentNumber: 12345,
				password: "testpass",
			};

			const result = validateLoginForm(formData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Student number must be 6 digits");
		});

		it("should reject form with missing password", () => {
			const formData = {
				studentNumber: 123456,
			};

			const result = validateLoginForm(formData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("Password is required");
		});
	});
});
