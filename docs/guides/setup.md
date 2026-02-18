# Setup and Development Guide

## System Requirements

- **Node.js**: 20+
- **Browser**: Chrome, Firefox, Edge, or Safari with ES6+ support

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AlexJSully/SciGrade.git
cd SciGrade
```

### 2. Install Dependencies

```bash
npm ci
```

This installs exact dependency versions from [package-lock.json](../../package-lock.json) (generated from [package.json](../../package.json)).

### 3. Start Local Server

```bash
npm run start
```

The application will be available at `http://localhost:3000`

## Local Development

### Available Scripts

From [package.json](../../package.json):

```bash
# Code Quality
npm run eslint:check      # Check for linting errors
npm run eslint            # Fix linting errors automatically
npm run prettier:check    # Check code formatting
npm run prettier          # Format code automatically

# Testing
npm run test              # Run jest unit tests
npm run test:jest         # Run jest unit tests only
npm run test:playwright:headless  # Run playwright tests headless
npm run test:playwright:ui        # Run playwright tests in UI mode

# Validation
npm run validate          # Run prettier, eslint, jest, and playwright tests

# Build & Service Worker
npm run workbox           # Generate service worker with workbox
```

## Project Structure

- [core/](../../core/) - Application assets and scripts
- [core/data/](../../core/data/) - JSON data files
- [core/data/Background_info/](../../core/data/Background_info/) - Gene background information
- [core/data/Benchling_gRNA_Outputs.json](../../core/data/Benchling_gRNA_Outputs.json) - guide RNA (gRNA) validation reference data
- [core/scripts/](../../core/scripts/) - Client-side scripts
- [core/scripts/APIandLibraries/](../../core/scripts/APIandLibraries/) - Third-party libraries (jQuery, Bootstrap)
- [core/scripts/serviceWorker/](../../core/scripts/serviceWorker/) - Service worker runtime
- [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js) - Main gRNA/primer validation logic
- [core/scripts/runtime.js](../../core/scripts/runtime.js) - Runtime practice flow helpers
- [core/styling/style.css](../../core/styling/style.css) - Application styles
- [core/images/](../../core/images/) - SVG and PNG assets
- [core/icon/](../../core/icon/) - PWA icons and manifest
- [index.html](../../index.html) - Landing page with Start link
- [core/systemrun.html](../../core/systemrun.html) - Application runtime entry
- [docs/](../) - Documentation directory
- [tests/](../../tests/) - Test suites
- [test-results/](../../test-results/) - Test output directory
- [package.json](../../package.json) - Dependencies and scripts
- [jest.config.mjs](../../jest.config.mjs) - Jest configuration
- [playwright.config.js](../../playwright.config.js) - Playwright configuration
- [eslint.config.js](../../eslint.config.js) - ESLint configuration
- [.prettierrc](../../.prettierrc) - Prettier configuration

## Configuration Files

### Data Files

The application loads data dynamically from JSON files:

#### Gene Background Information

[core/data/Background_info/gene_background_info.json](../../core/data/Background_info/gene_background_info.json)

Structure:

```json
{
	"gene_list": {
		"GENENAME": {
			"base_type": "practice|assignment",
			"name": "Full Gene Name",
			"Background": "Description of gene and mutation",
			"Target site": "Location and nature of target",
			"Target position": "Numeric position",
			"Sequence": "ACGT... full DNA sequence",
			"NCBI gene link": "https://..."
		}
	}
}
```

#### gRNA Validation Reference

[core/data/Benchling_gRNA_Outputs.json](../../core/data/Benchling_gRNA_Outputs.json)

Structure:

```json
{
  "gene_list": {
    "GENENAME": [
      {
        "Position": 123,
        "Strand": 1 | -1,
        "Sequence": "ACGTACGTACGTACGTACGT",
        "PAM": "NGG",
        "Specificity Score": 45.2,
        "Efficiency Score": 78.5
      }
    ]
  }
}
```

## Testing

### Jest Unit Tests

Test files:

- [core/scripts/crispr_scripts.test.js](../../core/scripts/crispr_scripts.test.js)
- [core/scripts/login.test.js](../../core/scripts/login.test.js)

Run tests:

```bash
npm run test:jest
```

### Playwright E2E Tests

Test files in [tests/playwright/](../../tests/playwright/):

- [homepage.spec.js](../../tests/playwright/homepage.spec.js) - Main UI tests
- [accessibility.js](../../tests/playwright/utils/accessibility.js) - Accessibility utilities

Run tests:

```bash
npm run test:playwright:headless  # CI mode
npm run test:playwright:ui         # Interactive mode
```

## Building for Production

### Service Worker Generation

Generate a service worker for offline support:

```bash
npm run workbox
```

This uses the configuration in [workbox-config.js](../../workbox-config.js).

### Code Minification

Minified versions are pre-built:

- [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js)
- [core/scripts/runtime.js](../../core/scripts/runtime.js)
- [core/styling/style.min.css](../../core/styling/style.min.css)

## Troubleshooting

### Port 3000 Already in Use

```bash
# Use a different port
http-server . -p 3001
```

### Dependencies Mismatch

```bash
# Clean reinstall
npm run regen-package-lock
```

### Service Worker Conflicts

- Clear browser cache and service worker registration
- In DevTools: Application > Service Workers > Unregister

## Related Documentation

- Read [../architecture/index.md](../architecture/index.md) for system design
- Review [../guides/marking-algorithm.md](../guides/marking-algorithm.md) for validation logic
- Check [../api/index.md](../api/index.md) for function documentation
