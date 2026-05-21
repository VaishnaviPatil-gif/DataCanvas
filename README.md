# Retrieval Integrity Auditor for RAG Systems

A clean, professional web dashboard for auditing the quality and integrity of retrieval results in Retrieval-Augmented Generation (RAG) systems.

## Overview

The Retrieval Integrity Auditor is an enterprise-grade UI designed for:
- Evaluating retrieval quality across query aspects
- Identifying gaps in document coverage
- Detecting noisy or irrelevant chunks
- Generating actionable improvement recommendations

## Features

### Input Section
- **User Query**: Enter the query submitted to the RAG system
- **Retrieved Chunks**: Paste top-k results with similarity scores (JSON or freetext)
- **Ground Truth (Optional)**: Provide expected evidence for enhanced analysis

### Dashboard View
1. **Scorecard Row**
   - Retrieval Integrity Score (0–100) with visual progress bar
   - Supporting chunks count
   - Noise chunks count
   - Aspect coverage percentage

2. **Aspect vs Chunk Coverage Heatmap**
   - Rows: Query aspects (auto-extracted from query)
   - Columns: Retrieved chunks
   - Cell colors:
     - **Green (✓)**: Aspect fully covered
     - **Orange (◐)**: Aspect partially covered
     - **Red (✗)**: Aspect missing
     - **Grey (○)**: Irrelevant/noise
   - **Interactive**: Click any cell to see chunk text and coverage explanation

3. **Missing Evidence Section**
   - Highlights aspects without supporting evidence
   - Lists aspects that should have been retrieved

4. **Retrieval Audit Report**
   - Overall assessment (Strong / Moderate / Poor)
   - Key issues identified
   - 6 actionable improvement recommendations:
     - Rewrite Query
     - Increase Top-k
     - Hybrid Retrieval
     - Improve Chunking
     - Re-rank Results
     - Expand Knowledge Base

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Responsive, enterprise-grade styling
- **Vanilla JavaScript**: No dependencies; lightweight logic

## Files

- `index.html` – Main dashboard markup
- `styles.css` – Styling (responsive, minimal, professional)
- `app.js` – Core audit logic and interactivity
- `README.md` – This file

## Getting Started

### Option 1: Open Locally in Browser

1. Clone or download this repository
2. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)
3. Start using the auditor

### Option 2: Serve via HTTP (Recommended for Production)

```bash
# Python 3
python -m http.server 8000

# Node.js (if installed)
npx http-server

# Or use any other local server
```

Then navigate to `http://localhost:8000`

## Usage

### Step 1: Enter Query
```
Example: "What are the key benefits of machine learning in healthcare?"
```

### Step 2: Paste Retrieved Chunks

**JSON Format (Recommended):**
```json
[
  { "id": 1, "text": "Machine learning enables automated diagnosis from medical images...", "score": 0.94 },
  { "id": 2, "text": "Benefits include improved patient outcomes...", "score": 0.87 },
  { "id": 3, "text": "The history of healthcare regulations is complex...", "score": 0.42 }
]
```

**Freetext Format:**
```
Machine learning enables automated diagnosis from medical images...
Benefits include improved patient outcomes...
The history of healthcare regulations is complex...
```

### Step 3: (Optional) Provide Ground Truth
Paste expected documents or relevant evidence to enhance analysis.

### Step 4: Run Audit
Click "Run Retrieval Audit" to generate the dashboard.

### Step 5: Analyze Results
- Review the Integrity Score
- Examine the heatmap for coverage gaps
- Click cells to see detailed explanations
- Read improvement recommendations

## How It Works

### Aspect Extraction
Aspects are automatically extracted from the query using keyword matching:
- Identifies action words: "what", "how", "why", "when", "where", etc.
- Extracts key concepts and phrases
- Max 5 aspects per query

### Coverage Computation
For each aspect-chunk pair:
- **Covered**: Aspect keyword appears in chunk text
- **Partial**: Indirect match or semantic similarity
- **Missing**: No relevant content in chunk
- **Irrelevant**: Chunk marked as unrelated or off-topic

### Integrity Score Calculation
```
Score = (Coverage Ratio × 80) - (Noise Penalty)
- Coverage Ratio: % of aspects covered (full or partial)
- Noise Penalty: Penalty for irrelevant chunks (up to 20 points)
- Range: 0–100
```

## Customization

### Add Custom Scoring Logic
Edit the `computeScores()` function in `app.js` to implement domain-specific scoring.

### Change Color Scheme
Modify CSS variables in `styles.css`:
- Primary: `#1e3a8a` (dark blue)
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Error: `#ef4444` (red)

### Add Backend Integration
Extend `runAudit()` to call a backend API for:
- Advanced NLP-based aspect extraction
- ML-powered relevance scoring
- Integration with external RAG systems

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations & Future Enhancements

### Current Limitations
- Aspect extraction uses simple keyword matching (not ML-based)
- Heatmap limited to ~10 chunks and ~5 aspects (for clarity)
- Scoring is heuristic-based, not ML-driven

### Planned Enhancements
- [ ] Integration with OpenAI / local LLM for aspect extraction
- [ ] Backend API for persistent audits
- [ ] Export audit reports as PDF
- [ ] Batch audit processing
- [ ] Custom scoring models per domain
- [ ] Integration with popular RAG frameworks (LangChain, LlamaIndex, etc.)

## License

This project is open source and available under the MIT License.

## Support & Feedback

For issues, feature requests, or suggestions, please open an issue or contact the maintainers.

---

**Designed for enterprise RAG evaluation and continuous improvement.**
