# Architecture

SciGrade is a client-side web application that dynamically renders the gRNA and primer validation interface. This section covers the system design, data flow, and component relationships.

## System Overview

```mermaid
graph TD
    A[Browser/Client] -->|HTTP Requests| B[Static Web Server]
    A -->|Load Scripts| C[crispr_scripts.js]
    A -->|Load Scripts| D[login.js]
    C -->|Fetch JSON| E["Gene Data<br/>(Benchling_gRNA_Outputs.json)"]
    C -->|Fetch JSON| F["Gene Info<br/>(gene_background_info.json)"]
    C -->|Call Functions| G[Marking Algorithm]
    D -->|Manage| H[User Sessions<br/>Legacy Code]
    G -->|Store Results| I["Browser LocalStorage<br/>Session Data"]
```

## Core Components

### Frontend Scripts

#### [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js)

Main application logic for gRNA and primer validation.

**Key Functions:**

- `loadCRISPRJSON_Files()` - Load gene data and benchling outputs asynchronously
- `fillGeneList()` - Populate gene selection dropdown
- `loadWork()` - Dynamically render the assignment form
- `checkAnswers()` - Validate student input against reference data
- `markAnswers()` - Calculate scores based on validation results
- `submitAnswers()` - Handle form submission

**Global State:**

- `selection_inMode` - Current mode ("practice" or "assignment")
- `current_gene` - Currently selected gene
- `gene_backgroundInfo` - Loaded gene reference data
- `benchling_gRNA_outputs` - Loaded gRNA validation reference

#### [core/scripts/login.js](../../core/scripts/login.js)

Legacy code for user management (authentication features deprecated in v1.2.0).

**Key Functions:**

- `checkStudentNumber()` - Legacy student credential validation
- `openAccountManagement()` - Legacy account modal (deprecated)
- `UpdateChooseUser()` - Legacy user switching (deprecated)

**Note:** These features are no longer used in the default configuration. See [CHANGELOG.md](../../CHANGELOG.md) for deprecation details.

### Data Files

#### [core/data/Benchling_gRNA_Outputs.json](../../core/data/Benchling_gRNA_Outputs.json)

Reference data for valid gRNA sequences and validation parameters.

Structure:

```json
{
 "gene_list": {
  "GENENAME": [
   {
    "Position": 123,
    "Strand": 1,
    "Sequence": "ACGTACGTACGTACGTACGT",
    "PAM": "NGG",
    "Specificity Score": 45.2,
    "Efficiency Score": 78.5
   }
  ]
 }
}
```

#### [core/data/Background_info/gene_background_info.json](../../core/data/Background_info/gene_background_info.json)

Educational background and metadata for each gene.

Structure:

```json
{
 "gene_list": {
  "GENENAME": {
   "base_type": "practice",
   "name": "Gene Full Name",
   "Background": "Educational description...",
   "Target site": "Nucleotide position X - target description",
   "Target position": "123",
   "Sequence": "ACGT...",
   "NCBI gene link": "https://..."
  }
 }
}
```

### Styling

#### [core/styling/style.css](../../core/styling/style.css)

Application styles covering:

- Layout and responsive design
- Form styling and validation states
- Feedback page appearance
- Modal dialogs and account management UI

Built with Bootstrap utilities integrated via [core/scripts/APIandLibraries/Bootstrap/](../../core/scripts/APIandLibraries/Bootstrap/).

### Icons & PWA Assets

[core/icon/](../../core/icon/) contains:

- `manifest.json` - PWA manifest for app installation
- Favicon files (multiple sizes)
- `browserconfig.xml` - Windows tile configuration

## Data Flow

### Initialization Flow

```mermaid
sequenceDiagram
    Browser->>index.html: Load page
    index.html->>crispr_scripts.js: Parse script
    index.html->>login.js: Parse script
    crispr_scripts.js->>loadCRISPRJSON_Files: Execute on load
    loadCRISPRJSON_Files->>Benchling_gRNA_Outputs.json: Fetch
    loadCRISPRJSON_Files->>gene_background_info.json: Fetch
    crispr_scripts.js->>fillGeneList: Populate dropdown
    login.js->>checkStudentNumber: Validate user if needed
```

### Assignment Workflow

```mermaid
sequenceDiagram
    Student->>UI: Select gene
    UI->>loadWork: Render assignment form
    Student->>UI: Enter gRNA + primers
    Student->>UI: Click Submit
    UI->>submitAnswers: Validate form
    submitAnswers->>checkAnswers: Check all fields
    checkAnswers->>Benchling_gRNA_Outputs.json: Compare gRNA
    checkAnswers->>gene_background_info.json: Get target position
    checkAnswers->>Marking Algorithm: Calculate score
    Marking Algorithm->>Student: Show feedback/results
```

### Marking Process

```mermaid
flowchart TD
    A[Student Submission] --> B{gRNA Sequence<br/>in Reference?}
    B -->|No| C[All Answers Wrong]
    B -->|Yes| D{Correct<br/>Strand?}
    D -->|No| C
    D -->|Yes| E{Off-target<br/>Score Valid?}
    E -->|No| C
    E -->|Yes| F{F1/R1<br/>Primers Valid?}
    F -->|No| G[Partial Credit]
    F -->|Yes| H[Full Credit]
    C --> I[Final Score & Feedback]
    G --> I
    H --> I
```

## Component Relationships

```mermaid
graph LR
    A["index.html<br/>(Entry Point)"]
    B["crispr_scripts.js<br/>(Validation & UI)"]
    C["login.js<br/>(Auth & Account)"]
    D["style.css<br/>(Styling)"]
    E["Benchling<br/>gRNA Outputs"]
    F["Gene Background<br/>Info"]

    A -->|loads| B
    A -->|loads| C
    A -->|includes| D
    B -->|fetches| E
    B -->|fetches| F
    C -->|depends on| B
```

## Offline Support

Service worker configuration in [workbox-config.js](../../workbox-config.js) enables:

- Offline browsing of cached pages
- Cached static assets (CSS, JS, images)
- Note: Dynamic gene data requires internet connection on first load

## Dependencies

### Frontend Libraries

Located in [core/scripts/APIandLibraries/](../../core/scripts/APIandLibraries/):

- **jQuery** - DOM manipulation and AJAX
- **Bootstrap** - CSS grid and utilities
- **tabletoCSV** - Export functionality (optional)
- **Material Icons** - Icon fonts

### Development Tools

From [package.json](../../package.json):

- **Jest** - Unit testing framework
- **Playwright** - E2E testing
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Workbox** - Service worker generation

## Security Considerations

1. **Content Security Policy** - Defined in [index.html](../../index.html) meta tags
2. **HTTPS Recommended** - Production should use HTTPS (Strict-Transport-Security header included)
3. **Input Validation** - Form inputs validated client-side and by marking algorithm

## Performance Optimizations

1. **Lazy Loading** - Gene data loaded on demand
2. **Minified Assets** - Pre-built minified versions available
3. **Service Worker Caching** - Static assets cached for offline access
4. **Client-side Rendering** - No server-side page generation overhead
