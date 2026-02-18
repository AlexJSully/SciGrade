# API Reference

This document provides detailed function signatures and descriptions for the core SciGrade modules.

## Core Modules

- [crispr_scripts.js](#crispr_scriptsjs) - Main gRNA and primer validation logic
- [runtime.js](#runtimejs) - Runtime flow helpers

## crispr_scripts.js

**Location:** [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js)

Core application logic for guide RNA (gRNA) sequence validation, marking, and feedback generation.

### Global Variables

```javascript
// Application state
let selection_inMode; // Current mode: "practice" or "assignment"
let current_gene; // Currently selected gene
let loadedMode; // Last mode that was loaded

// Reference data
let gene_backgroundInfo; // Loaded gene metadata
let benchling_gRNA_outputs; // Loaded gRNA validation data

// Marking state
let MARgRNAseq; // gRNA sequence validation result
let MARgRNAseq_degree; // gRNA validation degree (0-3)
let MARPAMseq; // Protospacer Adjacent Motif (PAM) sequence validation result
let MARCutPos; // Cut position validation result
let MARstrand; // Strand selection validation result
let MAROffTarget; // Off-target score validation result
let MARF1primers; // F1 primer validation result
let MARR1primers; // R1 primer validation result

// Gene list
const listOfGenes = ["eBFP", "ACTN3", "HBB", "CCR5", "ANKK1", "APOE"];
```

### Gene Selection

#### select_Gene()

```javascript
function select_Gene()
```

**Purpose:** Select a gene and load its assignment form.

**Behavior:**

- Validates that `possible_gene` is not empty
- Sets `current_gene` to `possible_gene`
- Calls `loadWork()` to render the form
- Resets marking state

**Error Handling:** Shows alert if gene selection fails (error code sG34-42)

**Example:**

```javascript
possible_gene = "HBB";
select_Gene(); // Loads HBB assignment form
```

### Data Loading

#### loadCRISPRJSON_Files()

```javascript
async function loadCRISPRJSON_Files()
```

**Purpose:** Asynchronously load gene reference data from JSON files.

**Fetches:**

- [`./data/Benchling_gRNA_Outputs.json`](../../core/data/Benchling_gRNA_Outputs.json) → `benchling_gRNA_outputs`
- [`./data/Background_info/gene_background_info.json`](../../core/data/Background_info/gene_background_info.json) → `gene_backgroundInfo`

**Error Handling:** Logs errors to console if fetch fails.

**Returns:** Promise (implicitly handled by async).

**Called By:** `redirectCRISPR()` in [core/scripts/runtime.js](../../core/scripts/runtime.js), which is triggered on page load from [core/systemrun.html](../../core/systemrun.html).

**Example:**

```javascript
await loadCRISPRJSON_Files();
console.log(benchling_gRNA_outputs.gene_list["HBB"]);
```

#### fillGeneList()

```javascript
function fillGeneList()
```

**Purpose:** Populate the gene selection dropdown from loaded data.

**Behavior:**

- Clears existing dropdown options
- Extracts gene names from `gene_backgroundInfo.gene_list`
- Appends options to HTML element with ID `gene_dropdown_selection`

**Prerequisite:** `gene_backgroundInfo` must be loaded first.

**HTML Required:**

```html
<select id="gene_dropdown_selection"></select>
```

**Example:**

```javascript
await loadCRISPRJSON_Files();
fillGeneList(); // Populates dropdown with eBFP, ACTN3, HBB, etc.
```

### Form Rendering

#### loadWork()

```javascript
function loadWork()
```

**Purpose:** Dynamically render the gRNA/primer submission form for the current gene.

**Behavior:**

- Clears the `#work` HTML element
- Sets `loadedMode` to `selection_inMode`
- Generates form HTML including:
    - Gene background information section
    - Input fields for gRNA sequence, PAM, strand, position, off-target score
    - Input fields for F1 and R1 primers
    - Submit button with `submitAnswers()` handler

**Renders to:** HTML element with ID `work`.

**Error Handling:** Shows alert if data is missing (error code lFS50-66).

**Example:**

```javascript
current_gene = "HBB";
loadWork(); // Renders form for HBB gene
```

### Input Validation

#### isNumberOrDashKey(evt)

```javascript
function isNumberOrDashKey(evt)
returns {boolean}
```

**Purpose:** Validate numeric input during form entry.

**Parameters:**

- `evt` {event} - JavaScript key press event

**Returns:**

- `true` if key is a number (0-9) or dash (-, .)
- `false` otherwise

**Used For:** Real-time validation of position and score fields.

**Example:**

```html
<input onkeypress="return isNumberOrDashKey(event)" />
```

### Answer Checking

#### checkAnswers()

```javascript
function checkAnswers()
```

**Purpose:** Validate all student-submitted answers against reference data.

**Process:**

1. Resets all marking variables
2. Retrieves student input from form fields
3. Searches for matching gRNA sequences in reference data with an exact, case-sensitive match after trimming
4. For each match:
    - Validates strand selection
    - Checks if target nucleotide is in range
    - Validates PAM sequence
    - Validates off-target score
    - Validates F1 and R1 primers
5. Sets global marking variables

**Sets Variables:**

- `MARgRNAseq`, `MARPAMseq`, `MARstrand`, `MAROffTarget`, `MARF1primers`, `MARR1primers`

**Called By:** `submitAnswers()`

**No Return Value** - Results stored in global variables.

#### checkOffTarget(score)

```javascript
function checkOffTarget(score)
```

**Purpose:** Validate off-target score against marking threshold.

**Parameters:**

- `score` {number} - Reference specificity score from the matched gRNA entry

**Behavior:**

- Compares the student input to the floor/ceiling of the reference specificity score
- Builds a score list within ±35 positions of the inputted cut position to determine an optimal threshold
- Uses `getOffTargetOptimalValue()` to determine the optimal threshold from the local max score
- Sets `MAROffTarget` and `MAROffTarget_degree` based on the input and calculated thresholds
- Degree values:
    - `0`: Wrong or below threshold
    - `1`: At or above the optimal threshold, or at or above 35 when the local max score is below 80
    - `2`: At or above 35 but below the optimal threshold when the local max score is at least 80
    - `3`: Only available option when the local max score is below 35

**Used For:** Part of `checkAnswers()` validation.

#### getOffTargetOptimalValue(maxRange)

```javascript
function getOffTargetOptimalValue(maxRange)
```

**Purpose:** Calculate the default optimal off-target threshold.

**Parameters:**

- `maxRange` {number} - Maximum specificity score in the local window

**Behavior:**

- Computes `minOptimal = maxRange - maxRange * 0.2`
- Returns `80` when `minOptimal` is greater than 80 or less than 35
- Returns `minOptimal` otherwise

#### checkF1Primers(seq)

```javascript
function checkF1Primers(seq)
```

**Purpose:** Validate forward primer sequence.

**Parameters:**

- `seq` {string} - Student's F1 primer input

**Behavior:**

- Builds candidate F1 primers using the `TAATACGACTCACTATAG` prefix and the first 16-20 bases of the input gRNA
- If the gRNA starts with `G`, also builds candidates using bases 2-20
- Sets `MARF1primers` when the submitted F1 primer matches a candidate

**Sets:** `MARF1primers` global variable.

**Example:**

```javascript
checkF1Primers("TAATACGACTCACTATAGCTCGTG...");
console.log(MARF1primers); // true or false
```

#### checkR1Primers(seq)

```javascript
function checkR1Primers(seq)
```

**Purpose:** Validate reverse primer sequence.

**Parameters:**

- `seq` {string} - Student's R1 primer input

**Behavior:**

- Generates a reverse-complement string using the `complementary_nt_dict` mapping
- Builds candidate R1 primers using the `TTCTAGCTCTAAAAC` prefix and the first 19-20 bases of the reverse complement
- Sets `MARR1primers` when the submitted R1 primer matches a candidate

**Sets:** `MARR1primers` global variable.

**Depends On:** Valid gRNA sequence already validated.

### Marking & Feedback

#### markAnswers()

```javascript
function markAnswers()
```

**Purpose:** Calculate final score based on validated answers.

**Behavior:**

- Processes results from `checkAnswers()`
- Assigns points for each correct component:
    - gRNA sequence
    - PAM
    - Off-target score
    - F1 primer
    - R1 primer
- Calculates weighted final score

**Prerequisite:** `checkAnswers()` must be called first.

**Sets/Updates:** Global marking variables with final scores.

**Called By:** `submitAnswers()` after `checkAnswers()`.

#### showFeedback()

```javascript
function showFeedback()
```

**Purpose:** Display marking results and feedback to student.

**Renders:**

- Component-by-component results and marks
- Explanatory text derived from the current marking state
- Candidate primer lists derived from the submitted gRNA sequence

**Rendered To:** `#mainContainer` in the runtime page.

**Called By:** `submitAnswers()` after `markAnswers()`.

### Form Submission

#### submitAnswers()

```javascript
function submitAnswers()
```

**Purpose:** Main workflow for form submission and marking.

**Workflow:**

1. Call `checkAnswers()` for validation
2. After a delay, call `markAnswers()` for scoring
3. Call `showFeedback()` to display results

**Form Elements Referenced:**

- `#sequence_input` - gRNA sequence
- `#pam_input` - PAM
- `#position_input` - Cut position
- `#strand_input` - Strand selection
- `#offtarget_input` - Off-target score
- `#f1_input` - F1 primer
- `#r1_input` - R1 primer

**Called By:** Submit button click event in rendered form.

#### IfPressEnter(event, toClickButton)

```javascript
function IfPressEnter(event, toClickButton)
```

**Purpose:** Trigger action when Enter key is pressed.

**Parameters:**

- `event` {Event} - Keyboard event
- `toClickButton` {string} - Button ID to trigger

**Behavior:** Simulates click on specified button if Enter key pressed.

**Example:**

```html
<input onkeypress="IfPressEnter(event, 'submitButton')" />
```

### Display Functions

#### showNewInput(docCheck, checkFor, docDisplay)

```javascript
function showNewInput(docCheck, checkFor, docDisplay)
```

**Purpose:** Show/hide HTML elements conditionally.

**Parameters:**

- `docCheck` {string} - Element ID to check
- `checkFor` {string} - Value to check for
- `docDisplay` {string} - Element ID to display/hide

**Behavior:** Shows `docDisplay` when `docCheck` matches `checkFor`.

## runtime.js

**Location:** [core/scripts/runtime.js](../../core/scripts/runtime.js)

Runtime flow helpers for the practice experience.

### loadGeneContent()

```javascript
function loadGeneContent()
```

**Purpose:** Read the selected gene and trigger gene loading.

**Behavior:**

- Sets `possible_gene` from `#gene_dropdown_selection`
- Calls `select_Gene()`

### redirectCRISPR()

```javascript
async function redirectCRISPR()
```

**Purpose:** Build the runtime selection UI and load reference data.

**Behavior:**

- Builds the selection UI in `#mainContainer`
- Calls `loadCRISPRJSON_Files()` and `fillGeneList()`

## Bootstrap & jQuery

### Bootstrap Classes

The application uses Bootstrap utilities for styling in [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js) and [core/systemrun.html](../../core/systemrun.html):

```html
<!-- Form controls -->
<div class="form-group">
	<label></label>
	<input class="form-control" />
</div>

<!-- Buttons -->
<button class="btn btn-primary">Submit</button>
<button class="btn btn-success">Save</button>

<!-- Grid -->
<div class="container">
	<div class="row">
		<div class="col"></div>
	</div>
</div>
```

### jQuery Selectors

```javascript
// Select by ID
$("#gene_dropdown_selection").empty();

// Append content
$("#work").append(append_str);

// Get form value
const value = $("#sequence_input").val();

// Find element
const element = document.getElementById("sequence_input");
```

## Error Codes

Error codes are raised by alerts in [core/scripts/crispr_scripts.js](../../core/scripts/crispr_scripts.js).

| Code     | Context       | Meaning               |
| -------- | ------------- | --------------------- |
| sG34-42  | select_Gene() | Gene selection failed |
| lFS50-66 | loadWork()    | Gene data not loaded  |

## Testing

Unit tests with Jest: [core/scripts/crispr_scripts.test.js](../../core/scripts/crispr_scripts.test.js)

Run tests:

```bash
npm run test:jest
```

## Related Documentation

- [Marking Algorithm](../guides/marking-algorithm.md) - Detailed validation logic
- [Data Structures](../guides/data-structures.md) - JSON format specifications
- [Architecture](../architecture/index.md) - System design overview
