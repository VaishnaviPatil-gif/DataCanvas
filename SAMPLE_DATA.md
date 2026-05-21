# Sample Test Data for Retrieval Integrity Auditor

## Test Case 1: Healthcare ML Benefits

### Query:
```
What are the key benefits of machine learning in healthcare?
```

### Retrieved Chunks (JSON):
```json
[
  {
    "id": 1,
    "text": "Machine learning algorithms can analyze medical images with higher accuracy than human radiologists, enabling early detection of diseases like cancer and heart conditions.",
    "score": 0.94
  },
  {
    "id": 2,
    "text": "ML models improve patient outcomes by personalizing treatment plans based on genetic and lifestyle factors, reducing adverse drug reactions.",
    "score": 0.91
  },
  {
    "id": 3,
    "text": "Automated diagnosis systems powered by deep learning can process thousands of patient records in seconds, improving operational efficiency in hospitals.",
    "score": 0.87
  },
  {
    "id": 4,
    "text": "The history of x-ray technology dates back to 1895 when Wilhelm Röntgen discovered electromagnetic radiation.",
    "score": 0.42
  },
  {
    "id": 5,
    "text": "Machine learning reduces healthcare costs by optimizing resource allocation and predicting patient admission rates.",
    "score": 0.85
  }
]
```

### Ground Truth (Optional):
```
Expected aspects covered:
1. Diagnostic accuracy improvement
2. Patient outcome personalization
3. Operational efficiency
4. Cost reduction
5. Risk prediction
```

---

## Test Case 2: Climate Change Policy

### Query:
```
How do carbon pricing mechanisms work and what is their impact on emissions reduction?
```

### Retrieved Chunks (JSON):
```json
[
  {
    "id": 1,
    "text": "Carbon pricing creates an economic incentive for emissions reduction by putting a price on carbon dioxide, encouraging companies to invest in cleaner technologies.",
    "score": 0.93
  },
  {
    "id": 2,
    "text": "Two main types exist: carbon taxes (direct price on emissions) and cap-and-trade systems (limits total emissions with tradeable permits).",
    "score": 0.89
  },
  {
    "id": 3,
    "text": "Studies show that carbon pricing leads to 5-15% emissions reduction depending on price level and policy design.",
    "score": 0.88
  },
  {
    "id": 4,
    "text": "The weather in Antarctica has been getting colder due to atmospheric changes.",
    "score": 0.31
  }
]
```

---

## How to Use

1. Copy the **Query** text
2. Paste it into the "User Query" field
3. Copy the **Retrieved Chunks** JSON
4. Paste it into the "Retrieved Chunks" field
5. (Optional) Paste Ground Truth
6. Click "Run Retrieval Audit"
7. Review the dashboard:
   - Integrity Score at the top
   - Heatmap in the center (click cells for details)
   - Missing evidence and recommendations below

---

## Expected Behavior

### Dashboard Rendering:
- ✓ Scorecard displays integrity score (0-100)
- ✓ Supporting chunks and noise chunks counted
- ✓ Aspect coverage heatmap generated
- ✓ Cells color-coded (green=covered, red=missing, orange=partial, grey=noise)
- ✓ Modal appears when clicking heatmap cells
- ✓ Missing evidence section lists uncovered aspects
- ✓ Audit report provides improvement recommendations

### Interactive Features:
- ✓ Click heatmap cells to see chunk text and explanation
- ✓ Back button returns to input form
- ✓ Modal closes on X or outside click
- ✓ Responsive design works on mobile/tablet
