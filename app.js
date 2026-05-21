// ======================================
// RETRIEVAL INTEGRITY AUDITOR
// Main Application Logic
// ======================================

// State
let auditState = {
    query: '',
    chunks: [],
    groundTruth: '',
    aspects: [],
    heatmapData: [],
    score: 0
};

// DOM Elements
const userQueryInput = document.getElementById('user-query');
const retrievedChunksInput = document.getElementById('retrieved-chunks');
const groundTruthInput = document.getElementById('ground-truth');
const runAuditBtn = document.getElementById('run-audit-btn');
const backBtn = document.getElementById('back-btn');

const inputSection = document.getElementById('input-section');
const dashboardSection = document.getElementById('dashboard-section');

const integrityScoreEl = document.getElementById('integrity-score');
const progressFillEl = document.getElementById('progress-fill');
const supportingChunksEl = document.getElementById('supporting-chunks');
const noiseChunksEl = document.getElementById('noise-chunks');
const coveragePercentEl = document.getElementById('coverage-percent');

const heatmapGridEl = document.getElementById('heatmap-grid');
const aspectLabelsEl = document.getElementById('aspect-labels');
const chunkHeaderEl = document.getElementById('chunk-header');

const missingEvidenceContent = document.getElementById('missing-evidence-content');
const auditReportContent = document.getElementById('audit-report-content');

const chunkModal = document.getElementById('chunk-modal');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modal-title');
const modalChunkText = document.getElementById('modal-chunk-text');
const modalCoverageExplanation = document.getElementById('modal-coverage-explanation');

// ======================================
// EVENT LISTENERS
// ======================================

runAuditBtn.addEventListener('click', runAudit);
backBtn.addEventListener('click', goBackToInput);
modalClose.addEventListener('click', closeModal);
chunkModal.addEventListener('click', (e) => {
    if (e.target === chunkModal) closeModal();
});

// ======================================
// MAIN AUDIT LOGIC
// ======================================

function runAudit() {
    const query = userQueryInput.value.trim();
    const chunksInput = retrievedChunksInput.value.trim();
    const groundTruth = groundTruthInput.value.trim();

    if (!query || !chunksInput) {
        alert('Please enter both User Query and Retrieved Chunks.');
        return;
    }

    // Show loading state
    runAuditBtn.disabled = true;
    runAuditBtn.innerHTML = '<span class="spinner"></span> Running Audit...';

    // Simulate processing
    setTimeout(() => {
        // Parse chunks
        let chunks = parseChunks(chunksInput);
        if (!chunks || chunks.length === 0) {
            alert('Failed to parse chunks. Please provide valid JSON or comma-separated chunks.');
            runAuditBtn.disabled = false;
            runAuditBtn.innerHTML = '▶ Run Retrieval Audit';
            return;
        }

        // Extract aspects from query (simple NLP-style extraction)
        const aspects = extractAspects(query);

        // Compute coverage matrix
        const heatmapData = computeHeatmapData(query, chunks, aspects, groundTruth);

        // Compute scores
        const scores = computeScores(heatmapData, chunks);

        // Store state
        auditState = {
            query,
            chunks,
            groundTruth,
            aspects,
            heatmapData,
            score: scores.integrityScore
        };

        // Render dashboard
        renderDashboard();
        showDashboard();

        // Reset button
        runAuditBtn.disabled = false;
        runAuditBtn.innerHTML = '▶ Run Retrieval Audit';
    }, 600);
}

function parseChunks(input) {
    try {
        // Try parsing as JSON
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) {
            return parsed.map((chunk, idx) => ({
                id: chunk.id || idx,
                text: chunk.text || chunk.content || JSON.stringify(chunk),
                score: chunk.score || 0.5
            }));
        }
    } catch (e) {
        // Fall back: split by newlines or numbered items
        const lines = input.split('\n').filter(l => l.trim());
        return lines.map((line, idx) => ({
            id: idx + 1,
            text: line.trim(),
            score: 0.5
        }));
    }
}

function extractAspects(query) {
    // Simple aspect extraction: split by keywords or punctuation
    const keywords = [
        'what', 'how', 'why', 'when', 'where', 'who', 'which',
        'definition', 'process', 'impact', 'risk', 'benefit', 'cost',
        'history', 'example', 'overview', 'detail', 'summary', 'analysis'
    ];

    const words = query.toLowerCase().match(/\b\w+\b/g) || [];
    const extractedAspects = [];

    // Extract key nouns and phrases
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (keywords.includes(word)) {
            // Capture context: keyword + next 2 words
            const phrase = words.slice(i, Math.min(i + 3, words.length))
                .join(' ')
                .charAt(0).toUpperCase() + 
                words.slice(i, Math.min(i + 3, words.length)).join(' ').slice(1);
            if (!extractedAspects.includes(phrase)) {
                extractedAspects.push(phrase);
            }
        }
    }

    // If no aspects found, create defaults from query
    if (extractedAspects.length === 0) {
        const chunks = query.split(/[,;.?]/);
        return chunks.slice(0, 3).map(c => c.trim().substring(0, 40) + '...').filter(c => c.length > 3);
    }

    return extractedAspects.slice(0, 5); // Max 5 aspects
}

function computeHeatmapData(query, chunks, aspects, groundTruth) {
    // For each aspect, compute coverage by each chunk
    const matrix = aspects.map(aspect => {
        return chunks.map(chunk => {
            const aspectLower = aspect.toLowerCase();
            const chunkLower = chunk.text.toLowerCase();
            const queryLower = query.toLowerCase();

            // Simple heuristic: keyword matching
            let coverage = 'missing'; // Default: missing

            if (chunkLower.includes(aspectLower)) {
                coverage = 'covered';
            } else if (
                (chunkLower.includes('irrelevant') || chunkLower.includes('unrelated')) &&
                !chunkLower.includes(queryLower.split(' ')[0])
            ) {
                coverage = 'irrelevant';
            } else if (
                chunkLower.split(' ').filter(word =>
                    aspectLower.includes(word) || word.includes(aspectLower.split(' ')[0])
                ).length > 0
            ) {
                coverage = 'partial';
            }

            // Boost coverage if chunk score is high
            if (chunk.score && chunk.score > 0.85 && coverage === 'missing') {
                coverage = 'partial';
            }

            return {
                aspect,
                chunkId: chunk.id,
                chunkText: chunk.text,
                coverage,
                chunkScore: chunk.score || 0.5
            };
        });
    });

    return matrix;
}

function computeScores(heatmapData, chunks) {
    const totalCells = heatmapData.length * heatmapData[0].length;
    let coveredCount = 0;
    let partialCount = 0;
    let missingCount = 0;
    let noiseCount = 0;
    let supportingChunks = 0;
    let noiseChunks = 0;

    heatmapData.forEach(row => {
        row.forEach(cell => {
            if (cell.coverage === 'covered') {
                coveredCount++;
                supportingChunks = Math.max(supportingChunks, cell.chunkId);
            } else if (cell.coverage === 'partial') {
                partialCount++;
            } else if (cell.coverage === 'missing') {
                missingCount++;
            } else if (cell.coverage === 'irrelevant') {
                noiseCount++;
                noiseChunks++;
            }
        });
    });

    // Calculate integrity score (0-100)
    const coverageRatio = (coveredCount + partialCount * 0.5) / heatmapData.length;
    const noisePenalty = (noiseCount / totalCells) * 20;
    const integrityScore = Math.max(0, Math.min(100,
        (coverageRatio * 80) - noisePenalty
    ));

    return {
        integrityScore: Math.round(integrityScore),
        supportingChunks: supportingChunks || 0,
        noiseChunks: noiseChunks || 0,
        coveragePercent: Math.round((coveredCount / heatmapData.length) * 100),
        coveredAspects: coveredCount,
        totalAspects: heatmapData.length
    };
}

// ======================================
// RENDERING FUNCTIONS
// ======================================

function renderDashboard() {
    const scores = computeScores(auditState.heatmapData, auditState.chunks);

    // Update scorecards
    integrityScoreEl.textContent = scores.integrityScore;
    progressFillEl.style.width = scores.integrityScore + '%';
    supportingChunksEl.textContent = auditState.chunks.length;
    noiseChunksEl.textContent = scores.noiseChunks;
    coveragePercentEl.textContent = scores.coveragePercent + '%';

    // Render heatmap
    renderHeatmap();

    // Render missing evidence
    renderMissingEvidence(scores);

    // Render audit report
    renderAuditReport(scores);
}

function renderHeatmap() {
    // Clear previous
    heatmapGridEl.innerHTML = '';
    aspectLabelsEl.innerHTML = '';
    chunkHeaderEl.innerHTML = '';

    const { heatmapData, chunks, aspects } = auditState;

    // Render aspect labels
    aspects.forEach(aspect => {
        const label = document.createElement('div');
        label.className = 'aspect-label';
        label.textContent = aspect;
        aspectLabelsEl.appendChild(label);
    });

    // Render chunk headers
    chunks.forEach((chunk, idx) => {
        const header = document.createElement('div');
        header.className = 'chunk-label';
        header.textContent = `C${idx + 1}`;
        header.title = `Chunk ${idx + 1}: ${chunk.text.substring(0, 50)}...`;
        chunkHeaderEl.appendChild(header);
    });

    // Render heatmap grid
    heatmapData.forEach((row, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'heatmap-row';

        row.forEach((cell) => {
            const cellEl = document.createElement('div');
            cellEl.className = `heatmap-cell ${cell.coverage}`;
            cellEl.textContent = cell.coverage === 'covered' ? '✓' : 
                                 cell.coverage === 'partial' ? '◐' : 
                                 cell.coverage === 'missing' ? '✗' : '○';
            
            cellEl.addEventListener('click', () => {
                showChunkModal(cell);
            });

            rowEl.appendChild(cellEl);
        });

        heatmapGridEl.appendChild(rowEl);
    });
}

function renderMissingEvidence(scores) {
    const { heatmapData, aspects } = auditState;

    // Find missing aspects
    const missingAspects = [];
    heatmapData.forEach((row, idx) => {
        const aspectCovered = row.some(cell => cell.coverage === 'covered' || cell.coverage === 'partial');
        if (!aspectCovered) {
            missingAspects.push(aspects[idx]);
        }
    });

    if (missingAspects.length === 0) {
        missingEvidenceContent.innerHTML = '<p style="color: #10b981; font-weight: 500;">✓ All query aspects have supporting evidence.</p>';
    } else {
        let html = '<p><strong>The following aspects lack adequate supporting evidence:</strong></p><ul>';
        missingAspects.forEach(aspect => {
            html += `<li><em>${aspect}</em> – No relevant chunks found</li>`;
        });
        html += '</ul>';
        missingEvidenceContent.innerHTML = html;
    }
}

function renderAuditReport(scores) {
    let html = '<div>';

    // Assessment summary
    if (scores.integrityScore >= 75) {
        html += '<p><strong style="color: #10b981;">Assessment: Strong Retrieval Quality ✓</strong></p>';
        html += '<p>The retrieval system successfully captured most relevant aspects of the query.</p>';
    } else if (scores.integrityScore >= 50) {
        html += '<p><strong style="color: #f59e0b;">Assessment: Moderate Retrieval Quality ~</strong></p>';
        html += '<p>The retrieval system retrieved some relevant content, but several aspects remain under-supported.</p>';
    } else {
        html += '<p><strong style="color: #ef4444;">Assessment: Poor Retrieval Quality ✗</strong></p>';
        html += '<p>The retrieval system failed to capture critical aspects of the query.</p>';
    }

    // Issues
    html += '<p><strong>Key Issues:</strong></p><ul>';
    if (scores.noiseChunks > 0) {
        html += `<li>${scores.noiseChunks} irrelevant or noisy chunk(s) in top-k results</li>`;
    }
    if (scores.coveragePercent < 100) {
        html += `<li>${100 - scores.coveragePercent}% of aspects lack direct evidence</li>`;
    }
    html += '</ul>';

    // Recommendations
    html += '<p><strong>Improvement Recommendations:</strong></p><ul>';
    html += '<li><strong>Rewrite Query:</strong> Make query more specific and explicit about desired aspects</li>';
    html += '<li><strong>Increase Top-k:</strong> Retrieve more candidates to improve coverage probability</li>';
    html += '<li><strong>Hybrid Retrieval:</strong> Combine BM25 + semantic search to capture different document aspects</li>';
    html += '<li><strong>Improve Chunking:</strong> Use finer-grain chunks with better boundary detection</li>';
    html += '<li><strong>Re-rank Results:</strong> Apply domain-specific re-rankers based on query aspect coverage</li>';
    html += '<li><strong>Expand Knowledge Base:</strong> Ensure comprehensive coverage of all query aspects in index</li>';
    html += '</ul>';

    html += '</div>';
    auditReportContent.innerHTML = html;
}

function showChunkModal(cell) {
    modalTitle.textContent = `Chunk ${cell.chunkId} – ${cell.aspect}`;
    modalChunkText.textContent = cell.chunkText;

    let explanation = '';
    if (cell.coverage === 'covered') {
        explanation = `✓ This chunk directly covers the "${cell.aspect}" aspect of the query. High relevance.`;
    } else if (cell.coverage === 'partial') {
        explanation = `◐ This chunk partially addresses the "${cell.aspect}" aspect. Indirect or incomplete coverage.`;
    } else if (cell.coverage === 'missing') {
        explanation = `✗ This chunk does not address the "${cell.aspect}" aspect. Irrelevant to this particular aspect.`;
    } else if (cell.coverage === 'irrelevant') {
        explanation = `○ This chunk is likely irrelevant or noisy relative to the overall query. May distract from core information needs.`;
    }

    explanation += ` (Similarity Score: ${cell.chunkScore.toFixed(2)})`;
    modalCoverageExplanation.textContent = explanation;

    chunkModal.style.display = 'flex';
}

function closeModal() {
    chunkModal.style.display = 'none';
}

// ======================================
// NAVIGATION
// ======================================

function showDashboard() {
    inputSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    window.scrollTo(0, 0);
}

function goBackToInput() {
    dashboardSection.style.display = 'none';
    inputSection.style.display = 'block';
    window.scrollTo(0, 0);
}

// ======================================
// INITIALIZATION
// ======================================

document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Ready to go
    console.log('Retrieval Integrity Auditor loaded.');
});
