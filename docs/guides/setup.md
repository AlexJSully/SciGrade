# Setup and Development Guide

## System Requirements

- **Node.js**: 14+ (includes npm)
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

This installs exact dependency versions from `package-lock.json` (generated from [package.json](../../package.json)).

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
npm run test              # Run all tests (jest + playwright)
npm run test:jest         # Run jest unit tests only
npm run test:playwright:headless  # Run playwright tests headless
npm run test:playwright:ui        # Run playwright tests in UI mode

# Validation
npm run validate          # Run prettier, eslint, jest, and playwright tests

# Build & Service Worker
npm run workbox           # Generate service worker with workbox
```

## Project Structure

```text
/core
  /data                    # JSON data files
    /Background_info       # Gene background information
    Benchling_gRNA_Outputs.json  # gRNA validation reference data
  /scripts
    /APIandLibraries       # Third-party libraries (jQuery, Bootstrap)
    /serviceWorker         # Service worker for offline support
    crispr_scripts.js      # Main gRNA/primer validation logic
    login.js               # Authentication and user management
  /styling
    style.css              # Application styles
  /images                  # SVG and PNG assets
  /icon                    # PWA icons and manifest
  index.html               # Main entry point

/docs                      # Documentation (this directory)
/tests
  /jest                    # Jest unit test configuration
  /playwright              # Playwright E2E test configuration
/test-results              # Test output directory

package.json               # Dependencies and scripts
jest.config.mjs            # Jest configuration
playwright.config.js       # Playwright configuration
eslint.config.js           # ESLint configuration
.prettierrc                # Prettier configuration
```

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

### Environment Configuration

#### Practice Mode by Default

The application is configured for practice mode where students can use SciGrade without any authentication system.

To enable authentication (for local deployment only), edit [core/scripts/login.js](../../core/scripts/login.js) line ~10:

```javascript
let continueWithoutLogin = false;
```

**Note:** The online authentication features were deprecated in v1.2.0. See [CHANGELOG.md](../../CHANGELOG.md) for details.

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

- [core/scripts/crispr_scripts.min.js](../../core/scripts/crispr_scripts.min.js)
- [core/scripts/login.min.js](../../core/scripts/login.min.js)
- [core/styling/style.min.css](../../core/styling/style.min.css)

These are generated through your build pipeline (outside the npm scripts).

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

## Next Steps

- Read [../architecture/index.md](../architecture/index.md) for system design
- Review [../guides/marking-algorithm.md](../guides/marking-algorithm.md) for validation logic
- Check [../api/index.md](../api/index.md) for function documentation
