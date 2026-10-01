import './style.css';

// Helper: Greatest Common Divisor
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Convert float to closest fraction given denominator
function toFraction(val, maxDenom = 24) {
  const roundedNum = Math.round(val * maxDenom);
  const common = gcd(roundedNum, maxDenom);
  return {
    num: roundedNum / common,
    den: maxDenom / common,
    originalNum: roundedNum,
    originalDen: maxDenom
  };
}

// Format fraction HTML
function formatFractionHtml(num, den) {
  if (den === 1) return `<span>${num}</span>`;
  const whole = Math.floor(num / den);
  const remainder = num % den;
  
  if (whole > 0 && remainder > 0) {
    return `
      <span class="fraction-whole">${whole}</span>
      <span class="fraction-view">
        <span class="fraction-num">${remainder}</span>
        <span class="fraction-den">${den}</span>
      </span>
    `;
  }
  
  return `
    <span class="fraction-view">
      <span class="fraction-num">${num}</span>
      <span class="fraction-den">${den}</span>
    </span>
  `;
}

// App State
const state = {
  min: 0,
  max: 1,
  currentVal: 0.5,
  denominator: 4, // 2, 3, 4, 5, 6, 8, 10, 12
  displayFormat: 'both', // 'both', 'fraction', 'decimal', 'hidden'
  snapToTicks: true,
  activeMode: 'explore', // 'explore' | 'quiz'
  
  // Quiz state
  quiz: {
    targetVal: 0.75,
    targetType: 'fraction', // 'fraction' | 'decimal'
    targetNumerator: 3,
    targetDenominator: 4,
    score: 0,
    streak: 0,
    feedback: null,
    checked: false
  }
};

// Initialize Application UI
function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <main class="app-container">
      <!-- Header -->
      <header class="app-header">
        <div class="brand-wrapper">
          <div class="brand-icon">📏</div>
          <div>
            <h1 class="brand-title">NLine</h1>
            <p class="brand-tagline">Interaktiver Zahlstrahl für Brüche & Dezimalbrüche</p>
          </div>
        </div>

        <nav class="mode-tabs" aria-label="Lernmodus">
          <button id="btn-mode-explore" class="mode-tab-btn ${state.activeMode === 'explore' ? 'active' : ''}">
            🔍 Erkunden
          </button>
          <button id="btn-mode-quiz" class="mode-tab-btn ${state.activeMode === 'quiz' ? 'active' : ''}">
            🎯 Quiz & Üben
          </button>
        </nav>
      </header>

      <!-- Quiz Panel (if active) -->
      <section id="quiz-panel-section" style="${state.activeMode === 'quiz' ? '' : 'display: none;'}" class="quiz-panel">
        <div class="quiz-header">
          <span class="quiz-badge">Trainingsmodus</span>
          <div class="quiz-score">Punkte: <span id="quiz-score-val">${state.quiz.score}</span> (Serie: <span id="quiz-streak-val">${state.quiz.streak}</span> 🔥)</div>
        </div>
        <div class="quiz-task-box">
          <div class="quiz-instruction">Verschiebe den Zeiger auf folgende Zahl:</div>
          <div id="quiz-target-display" class="quiz-target-val"></div>
        </div>
        <div class="quiz-actions">
          <button id="btn-check-quiz" class="btn-primary">Überprüfen</button>
          <button id="btn-next-quiz" class="btn-secondary" style="display: none;">Nächste Aufgabe ➔</button>
        </div>
        <div id="quiz-feedback-box" class="quiz-feedback" style="display: none;"></div>
      </section>

      <!-- Toolbar Controls -->
      <section class="toolbar-card">
        <div class="control-group">
          <span class="control-label">Bereich:</span>
          <div class="pill-group" id="range-selector">
            <button class="pill-btn ${state.max === 1 ? 'active' : ''}" data-max="1">0 bis 1</button>
            <button class="pill-btn ${state.max === 2 ? 'active' : ''}" data-max="2">0 bis 2</button>
            <button class="pill-btn ${state.max === 5 ? 'active' : ''}" data-max="5">0 bis 5</button>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label" for="denom-select">Teilung (Nenner):</label>
          <select id="denom-select" class="custom-select">
            <option value="2">Halbe (1/2)</option>
            <option value="3">Drittel (1/3)</option>
            <option value="4" selected>Viertel (1/4)</option>
            <option value="5">Fünftel (1/5)</option>
            <option value="6">Sechstel (1/6)</option>
            <option value="8">Achtel (1/8)</option>
            <option value="10">Zehntel / 0,1</option>
            <option value="12">Zwölftel (1/12)</option>
          </select>
        </div>

        <div class="control-group">
          <span class="control-label">Anzeige:</span>
          <div class="pill-group" id="format-selector">
            <button class="pill-btn ${state.displayFormat === 'both' ? 'active' : ''}" data-format="both">Beides</button>
            <button class="pill-btn ${state.displayFormat === 'fraction' ? 'active' : ''}" data-format="fraction">Brüche</button>
            <button class="pill-btn ${state.displayFormat === 'decimal' ? 'active' : ''}" data-format="decimal">Dezimal</button>
            <button class="pill-btn ${state.displayFormat === 'hidden' ? 'active' : ''}" data-format="hidden">Verdeckt</button>
          </div>
        </div>

        <div class="control-group">
          <span class="control-label">Raster:</span>
          <button id="btn-toggle-snap" class="pill-btn ${state.snapToTicks ? 'active' : ''}">
            ${state.snapToTicks ? '🧲 Einrasten: An' : '🔓 Frei bewegen'}
          </button>
        </div>
      </section>

      <!-- Main Number Line Canvas Card -->
      <section class="canvas-card">
        <!-- Live Value Displays -->
        <div class="value-display-row">
          <div class="stat-badge fraction-badge">
            <div class="stat-title">Bruchdarstellung</div>
            <div id="stat-fraction-val" class="stat-value"></div>
          </div>
          <div class="stat-badge decimal-badge">
            <div class="stat-title">Dezimalbruch</div>
            <div id="stat-decimal-val" class="stat-value"></div>
          </div>
          <div class="stat-badge percent-badge">
            <div class="stat-title">Prozentwert</div>
            <div id="stat-percent-val" class="stat-value"></div>
          </div>
        </div>

        <!-- SVG Number Line -->
        <div class="numberline-wrapper" id="numberline-container">
          <svg id="numberline-svg" class="numberline-svg" viewBox="0 0 1000 180" preserveAspectRatio="none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0f172a" />
              </marker>
            </defs>
            <g id="ticks-layer"></g>
            <line id="axis-line" x1="40" y1="80" x2="960" y2="80" stroke="#0f172a" stroke-width="3" marker-end="url(#arrow)" />
            <g id="pointer-group" class="pointer-group" transform="translate(500, 80)">
              <!-- Pin Pointer -->
              <path d="M 0 0 L -12 -28 C -18 -38, -12 -54, 0 -54 C 12 -54, 18 -38, 12 -28 Z" fill="#4f46e5" class="pointer-pin" />
              <circle cx="0" cy="-40" r="5" fill="#ffffff" />
              <circle cx="0" cy="0" r="4" fill="#4f46e5" />
            </g>
          </svg>
        </div>

        <!-- Strip Model / Bruchbalken -->
        <div class="strip-model-section">
          <div class="strip-model-header">
            <span>Veranschaulichung als Streifenmodell (Bruchbalken von 0 bis 1):</span>
            <span id="strip-ratio-text"></span>
          </div>
          <div id="strip-bar-container" class="strip-bar-container"></div>
        </div>
      </section>

      <!-- Educational Tips / Controls Info -->
      <footer class="info-card">
        <div>
          💡 <strong>Tipp:</strong> Klicke direkt auf den Zahlstrahl oder ziehe den Zeiger mit der Maus oder dem Finger.
        </div>
        <div>
          Tastatur: <span class="shortcut-badge">←</span> <span class="shortcut-badge">→</span> Feinschritte
        </div>
      </footer>
    </main>
  `;

  attachEventListeners();
  renderNumberLine();
  updateValueDisplay();
  renderStripModel();
  if (state.activeMode === 'quiz') {
    generateNewQuizTask();
  }
}

// Attach Event Listeners
function attachEventListeners() {
  // Tabs
  document.getElementById('btn-mode-explore').addEventListener('click', () => setMode('explore'));
  document.getElementById('btn-mode-quiz').addEventListener('click', () => setMode('quiz'));

  // Range
  document.querySelectorAll('#range-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#range-selector button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.max = parseFloat(e.target.dataset.max);
      if (state.currentVal > state.max) {
        state.currentVal = state.max;
      }
      renderNumberLine();
      updateValueDisplay();
      renderStripModel();
    });
  });

  // Denominator Select
  const denomSelect = document.getElementById('denom-select');
  denomSelect.addEventListener('change', (e) => {
    state.denominator = parseInt(e.target.value, 10);
    if (state.snapToTicks) {
      snapValueToGrid();
    }
    renderNumberLine();
    updateValueDisplay();
    renderStripModel();
  });

  // Display Format
  document.querySelectorAll('#format-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#format-selector button').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.displayFormat = e.target.dataset.format;
      renderNumberLine();
    });
  });

  // Snap Toggle
  const snapBtn = document.getElementById('btn-toggle-snap');
  snapBtn.addEventListener('click', () => {
    state.snapToTicks = !state.snapToTicks;
    snapBtn.classList.toggle('active', state.snapToTicks);
    snapBtn.innerHTML = state.snapToTicks ? '🧲 Einrasten: An' : '🔓 Frei bewegen';
    if (state.snapToTicks) {
      snapValueToGrid();
      updatePointerPosition();
      updateValueDisplay();
      renderStripModel();
    }
  });

  // Dragging and Touch Interaction
  const svg = document.getElementById('numberline-svg');
  let isDragging = false;

  function handlePointerMove(e) {
    if (!isDragging) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const xInSvg = ((clientX - rect.left) / rect.width) * 1000;
    
    // Axis line goes from 60 to 940 (leave margin for arrow)
    const lineStart = 60;
    const lineEnd = 940;
    const clampedX = Math.max(lineStart, Math.min(lineEnd, xInSvg));
    const ratio = (clampedX - lineStart) / (lineEnd - lineStart);
    let newVal = state.min + ratio * (state.max - state.min);

    if (state.snapToTicks) {
      const step = 1 / state.denominator;
      newVal = Math.round(newVal / step) * step;
    }

    state.currentVal = Math.max(state.min, Math.min(state.max, newVal));
    updatePointerPosition();
    updateValueDisplay();
    renderStripModel();
  }

  function startDrag(e) {
    isDragging = true;
    handlePointerMove(e);
  }

  function stopDrag() {
    isDragging = false;
  }

  svg.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('mouseup', stopDrag);

  svg.addEventListener('touchstart', (e) => {
    isDragging = true;
    handlePointerMove(e);
  }, { passive: false });
  window.addEventListener('touchmove', handlePointerMove, { passive: false });
  window.addEventListener('touchend', stopDrag);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    const step = 1 / state.denominator;
    if (e.key === 'ArrowRight') {
      state.currentVal = Math.min(state.max, state.currentVal + step);
      if (state.snapToTicks) snapValueToGrid();
      updatePointerPosition();
      updateValueDisplay();
      renderStripModel();
    } else if (e.key === 'ArrowLeft') {
      state.currentVal = Math.max(state.min, state.currentVal - step);
      if (state.snapToTicks) snapValueToGrid();
      updatePointerPosition();
      updateValueDisplay();
      renderStripModel();
    }
  });

  // Quiz events
  document.getElementById('btn-check-quiz')?.addEventListener('click', checkQuizAnswer);
  document.getElementById('btn-next-quiz')?.addEventListener('click', generateNewQuizTask);
}

function snapValueToGrid() {
  const step = 1 / state.denominator;
  state.currentVal = Math.round(state.currentVal / step) * step;
}

function setMode(mode) {
  state.activeMode = mode;
  document.getElementById('btn-mode-explore').classList.toggle('active', mode === 'explore');
  document.getElementById('btn-mode-quiz').classList.toggle('active', mode === 'quiz');
  
  const quizPanel = document.getElementById('quiz-panel-section');
  if (quizPanel) {
    quizPanel.style.display = mode === 'quiz' ? 'flex' : 'none';
  }
  if (mode === 'quiz') {
    generateNewQuizTask();
  }
}

// Render Number Line SVG Ticks and Labels
function renderNumberLine() {
  const ticksLayer = document.getElementById('ticks-layer');
  if (!ticksLayer) return;
  ticksLayer.innerHTML = '';

  const lineStart = 60;
  const lineEnd = 940;
  const totalLength = lineEnd - lineStart;
  const totalUnits = state.max - state.min;
  const totalSubdivisions = Math.round(totalUnits * state.denominator);

  for (let i = 0; i <= totalSubdivisions; i++) {
    const val = state.min + (i / state.denominator);
    const x = lineStart + ((val - state.min) / totalUnits) * totalLength;
    const isWhole = Math.abs(val - Math.round(val)) < 0.0001;
    const isHalf = Math.abs((val * 2) - Math.round(val * 2)) < 0.0001;

    let tickHeight = 16;
    let tickClass = 'tick-minor';

    if (isWhole) {
      tickHeight = 36;
      tickClass = 'tick-major';
    } else if (isHalf && state.denominator % 2 === 0) {
      tickHeight = 26;
      tickClass = 'tick-medium';
    }

    // Tick line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', 80 - tickHeight / 2);
    line.setAttribute('x2', x);
    line.setAttribute('y2', 80 + tickHeight / 2);
    line.setAttribute('class', `tick-line ${tickClass}`);
    ticksLayer.appendChild(line);

    // Labels
    if (state.displayFormat !== 'hidden') {
      if (isWhole) {
        // Whole number label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 125);
        text.setAttribute('class', 'tick-label-text');
        text.textContent = Math.round(val).toString();
        ticksLayer.appendChild(text);
      } else {
        // Intermediate labels
        const frac = toFraction(val, state.denominator);
        const decVal = (Math.round(val * 100) / 100).toString().replace('.', ',');

        if (state.displayFormat === 'both' || state.displayFormat === 'fraction') {
          const fracText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          fracText.setAttribute('x', x);
          fracText.setAttribute('y', state.displayFormat === 'both' ? 122 : 124);
          fracText.setAttribute('class', 'tick-fraction-text');
          fracText.textContent = `${frac.num}/${frac.den}`;
          ticksLayer.appendChild(fracText);
        }

        if (state.displayFormat === 'both' || state.displayFormat === 'decimal') {
          const decText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          decText.setAttribute('x', x);
          decText.setAttribute('y', state.displayFormat === 'both' ? 142 : 124);
          decText.setAttribute('class', 'tick-decimal-text');
          decText.textContent = decVal;
          ticksLayer.appendChild(decText);
        }
      }
    }
  }

  updatePointerPosition();
}

// Update Pointer Position
function updatePointerPosition() {
  const pointer = document.getElementById('pointer-group');
  if (!pointer) return;
  const lineStart = 60;
  const lineEnd = 940;
  const totalLength = lineEnd - lineStart;
  const x = lineStart + ((state.currentVal - state.min) / (state.max - state.min)) * totalLength;
  pointer.setAttribute('transform', `translate(${x}, 80)`);
}

// Update Live Value Stat Cards
function updateValueDisplay() {
  const fracEl = document.getElementById('stat-fraction-val');
  const decEl = document.getElementById('stat-decimal-val');
  const percEl = document.getElementById('stat-percent-val');
  if (!fracEl || !decEl || !percEl) return;

  const frac = toFraction(state.currentVal, state.denominator);
  fracEl.innerHTML = formatFractionHtml(frac.num, frac.den);
  
  // Format decimal in German locale (comma instead of dot)
  const decStr = (Math.round(state.currentVal * 1000) / 1000).toLocaleString('de-DE', {
    maximumFractionDigits: 3
  });
  decEl.textContent = decStr;

  const percentStr = (Math.round(state.currentVal * 1000) / 10).toLocaleString('de-DE', {
    maximumFractionDigits: 1
  }) + ' %';
  percEl.textContent = percentStr;
}

// Render the Visual Strip Model (Bruchstreifen)
function renderStripModel() {
  const container = document.getElementById('strip-bar-container');
  const ratioLabel = document.getElementById('strip-ratio-text');
  if (!container || !ratioLabel) return;

  container.innerHTML = '';
  const frac = toFraction(Math.min(1, state.currentVal), state.denominator);
  ratioLabel.textContent = `${frac.num} von ${state.denominator} Teilen markiert (${Math.round((frac.num / state.denominator) * 100)} %)`;

  for (let i = 0; i < state.denominator; i++) {
    const segment = document.createElement('div');
    segment.style.flex = '1';
    const isActive = i < frac.num;
    segment.className = `strip-segment ${isActive ? 'active' : 'inactive'}`;
    segment.textContent = `1/${state.denominator}`;
    container.appendChild(segment);
  }
}

// Quiz Generation
function generateNewQuizTask() {
  state.quiz.checked = false;
  const checkBtn = document.getElementById('btn-check-quiz');
  const nextBtn = document.getElementById('btn-next-quiz');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  if (checkBtn) checkBtn.style.display = 'inline-block';
  if (nextBtn) nextBtn.style.display = 'none';
  if (feedbackBox) feedbackBox.style.display = 'none';

  // Random task within 0 and state.max
  const numSteps = Math.round(state.max * state.denominator);
  const randStep = Math.floor(Math.random() * numSteps) + 1;
  const targetVal = randStep / state.denominator;
  state.quiz.targetVal = targetVal;

  const isFraction = Math.random() > 0.5;
  state.quiz.targetType = isFraction ? 'fraction' : 'decimal';

  const frac = toFraction(targetVal, state.denominator);
  state.quiz.targetNumerator = frac.num;
  state.quiz.targetDenominator = frac.den;

  const displayEl = document.getElementById('quiz-target-display');
  if (displayEl) {
    if (isFraction) {
      displayEl.innerHTML = formatFractionHtml(frac.num, frac.den);
    } else {
      displayEl.textContent = (Math.round(targetVal * 100) / 100).toLocaleString('de-DE');
    }
  }
}

// Quiz Verification
function checkQuizAnswer() {
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const checkBtn = document.getElementById('btn-check-quiz');
  const nextBtn = document.getElementById('btn-next-quiz');
  const scoreEl = document.getElementById('quiz-score-val');
  const streakEl = document.getElementById('quiz-streak-val');

  const diff = Math.abs(state.currentVal - state.quiz.targetVal);
  const tolerance = (1 / state.denominator) * 0.4;

  feedbackBox.style.display = 'block';

  if (diff <= tolerance) {
    // Correct
    state.quiz.score += 10;
    state.quiz.streak += 1;
    feedbackBox.className = 'quiz-feedback feedback-success';
    feedbackBox.innerHTML = `🎉 <strong>Perfekt getroffen!</strong> Du hast die Zahl genau am Zahlstrahl gefunden. (+10 Punkte)`;
  } else {
    // Near or wrong
    state.quiz.streak = 0;
    const targetFrac = toFraction(state.quiz.targetVal, state.denominator);
    feedbackBox.className = 'quiz-feedback feedback-near';
    feedbackBox.innerHTML = `Bravo für den Versuch! Die gesuchte Position lag bei <strong>${targetFrac.num}/${targetFrac.den}</strong> (${state.quiz.targetVal.toLocaleString('de-DE')}). Du standest bei ${state.currentVal.toLocaleString('de-DE')}.`;
  }

  scoreEl.textContent = state.quiz.score;
  streakEl.textContent = state.quiz.streak;

  checkBtn.style.display = 'none';
  nextBtn.style.display = 'inline-block';
}

// Run initial setup
document.addEventListener('DOMContentLoaded', initApp);
