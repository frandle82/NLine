import './style.css';

const NS = 'http://www.w3.org/2000/svg';
const state = {
  mode: null,
  numerator: 3,
  denominator: 4,
  decimal: 0.37,
  places: 2,
  decimalRange: 'full',
  support: true,
  sliderValue: 0,
};

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="app">
    <header class="topbar">
      <div class="logo"><span>N</span><strong>NLine</strong></div>
      <span class="grade">Mathematik · Klasse 6</span>
    </header>

    <section class="choice-screen" id="choice-screen" aria-labelledby="choice-title">
      <div class="choice-copy">
        <h1 id="choice-title">Was möchtest du darstellen?</h1>
        <p>Wähle eine Zahlenart aus.</p>
      </div>
      <div class="choices">
        <button class="choice" type="button" data-mode="fraction">
          <span class="choice-example fraction-example"><i>3</i><i>4</i></span>
          <span><strong>Brüche</strong><small>Teile eines Ganzen</small></span>
        </button>
        <button class="choice" type="button" data-mode="decimal">
          <span class="choice-example">0,37</span>
          <span><strong>Dezimalbrüche</strong><small>Zehntel, Hundertstel, Tausendstel</small></span>
        </button>
      </div>
    </section>

    <section class="work-screen" id="work-screen" hidden>
      <div class="work-head">
        <button class="back" id="back" type="button" aria-label="Andere Zahlenart wählen">‹ <span>Auswahl</span></button>
        <h1 id="work-title"></h1>
        <span></span>
      </div>

      <section class="settings" id="fraction-settings" hidden>
        <div class="fraction-readout" aria-label="Aktueller Bruch"><strong id="fraction-num">3</strong><i></i><strong id="fraction-den">4</strong><span id="mixed-number">echter Bruch</span></div>
        <div class="fraction-builder">
          <div class="fraction-controls">
            <div class="parts-control">
              <label for="numerator-input">Markierte Teile (Zähler)</label>
              <div class="stepper"><button id="numerator-minus" type="button" aria-label="Ein markiertes Teil weniger">−</button><input id="numerator-input" type="number" inputmode="numeric" min="1" max="60" value="3"><button id="numerator-plus" type="button" aria-label="Ein markiertes Teil mehr">+</button></div>
            </div>
            <div class="parts-control">
              <label for="parts-input">Teile pro Ganzem (Nenner)</label>
              <div class="stepper"><button id="parts-minus" type="button" aria-label="Ein Teil weniger">−</button><input id="parts-input" type="number" inputmode="numeric" min="2" max="12" value="4"><button id="parts-plus" type="button" aria-label="Ein Teil mehr">+</button></div>
            </div>
          </div>
          <div>
            <p class="field-label">Tippe auf ein Feld, um den Zähler zu ändern.</p>
            <div class="fraction-parts" id="fraction-parts" role="group" aria-label="Teile des Bruches"></div>
          </div>
        </div>
      </section>

      <section class="settings decimal-settings" id="decimal-settings" hidden>
        <label class="decimal-value">Dezimalzahl<input id="decimal-input" type="text" inputmode="decimal" value="0,37" autocomplete="off"></label>
        <fieldset class="places">
          <legend>Nachkommastellen</legend>
          <div><button type="button" data-places="1">1</button><button class="active" type="button" data-places="2">2</button><button type="button" data-places="3">3</button></div>
        </fieldset>
        <fieldset class="decimal-range">
          <legend>Ansicht</legend>
          <div><button type="button" data-range="excerpt">Ausschnitt</button><button class="active" type="button" data-range="full">Gesamter Bereich</button></div>
        </fieldset>
      </section>

      <section class="numberline-panel" aria-labelledby="line-title">
        <div class="line-head">
          <div><h2 id="line-title">Zahlenstrahl</h2><p id="scale-text"></p></div>
          <label class="support-toggle"><input id="support" type="checkbox" checked><span></span><b>Schiebehilfe</b></label>
        </div>
        <div class="line-stage">
          <output id="slider-value" class="slider-value" for="slider"></output>
          <svg id="numberline" viewBox="0 0 1000 180" role="img" aria-label="Zahlenstrahl"><g id="bands"></g><line class="axis" x1="70" y1="88" x2="930" y2="88"></line><path class="arrow" d="M930 79 L949 88 L930 97 Z"></path><g id="ticks"></g></svg>
          <input id="slider" class="slider" type="range" aria-label="Wert auf dem Zahlenstrahl abfahren">
        </div>
      </section>
    </section>
  </main>`;

const $ = (selector) => document.querySelector(selector);
const elements = {
  choice: $('#choice-screen'), work: $('#work-screen'), title: $('#work-title'),
  fractionSettings: $('#fraction-settings'), decimalSettings: $('#decimal-settings'),
  parts: $('#fraction-parts'), partsInput: $('#parts-input'), numeratorInput: $('#numerator-input'),
  fractionNum: $('#fraction-num'), fractionDen: $('#fraction-den'), mixedNumber: $('#mixed-number'),
  decimalInput: $('#decimal-input'), support: $('#support'), slider: $('#slider'), sliderValue: $('#slider-value'),
  ticks: $('#ticks'), bands: $('#bands'), scaleText: $('#scale-text'),
};

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function svg(name, attrs = {}, text = '') { const node = document.createElementNS(NS, name); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); node.textContent = text; return node; }
function xFor(value, scale) { return 70 + ((value - scale.min) / (scale.max - scale.min)) * 860; }

function decimalFromInput() {
  const value = Number(elements.decimalInput.value.trim().replace(',', '.'));
  return Number.isFinite(value) ? clamp(value, 0, 20) : 0;
}

function scale() {
  if (state.mode === 'fraction') {
    const target = state.numerator / state.denominator;
    return { min: 0, max: Math.max(1, Math.ceil(target)), step: 1 / state.denominator, target };
  }
  const target = state.decimal;
  const step = 10 ** -state.places;
  if (state.decimalRange === 'excerpt') {
    const span = step * 10;
    const min = Math.floor((target + step / 100) / span) * span;
    return { min, max: min + span, step, target };
  }
  return { min: 0, max: Math.max(1, Math.ceil(target)), step, target };
}

function fractionLabel(value) {
  const numerator = Math.round(value * state.denominator);
  const whole = Math.floor(numerator / state.denominator);
  const remainder = numerator % state.denominator;
  if (whole === 0) return `${numerator}/${state.denominator}`;
  if (remainder === 0) return `${numerator}/${state.denominator} = ${whole}`;
  return `${numerator}/${state.denominator} = ${whole} ${remainder}/${state.denominator}`;
}

function decimalLabel(value) {
  return value.toLocaleString('de-DE', { minimumFractionDigits: state.places, maximumFractionDigits: state.places, useGrouping: false });
}

function valueLabel(value) { return state.mode === 'fraction' ? fractionLabel(value) : decimalLabel(value); }

function renderParts() {
  elements.parts.replaceChildren();
  const wholeCount = Math.max(1, Math.ceil(state.numerator / state.denominator));
  for (let whole = 0; whole < wholeCount; whole += 1) {
    const row = document.createElement('div');
    row.className = 'whole-row';
    row.style.setProperty('--parts', state.denominator);
    row.setAttribute('aria-label', `${whole + 1}. Ganzes`);
    for (let partIndex = 1; partIndex <= state.denominator; partIndex += 1) {
      const index = whole * state.denominator + partIndex;
      const part = document.createElement('button');
      part.type = 'button';
      part.className = index <= state.numerator ? 'selected' : '';
      part.setAttribute('aria-label', `Zähler auf ${index} setzen`);
      part.setAttribute('aria-pressed', String(index <= state.numerator));
      part.addEventListener('click', () => { state.numerator = index; renderAll(true); });
      row.append(part);
    }
    elements.parts.append(row);
  }
  elements.fractionNum.textContent = state.numerator;
  elements.fractionDen.textContent = state.denominator;
  const whole = Math.floor(state.numerator / state.denominator);
  const remainder = state.numerator % state.denominator;
  if (whole === 0) elements.mixedNumber.textContent = 'echter Bruch';
  else if (remainder === 0) elements.mixedNumber.textContent = `= ${whole} ${whole === 1 ? 'Ganzes' : 'Ganze'}`;
  else elements.mixedNumber.textContent = `= ${whole} ${remainder}/${state.denominator}`;
  elements.numeratorInput.value = state.numerator;
  elements.partsInput.value = state.denominator;
}

function renderLine(resetSlider = false) {
  const currentScale = scale();
  const totalSteps = Math.round((currentScale.max - currentScale.min) / currentScale.step);
  elements.ticks.replaceChildren(); elements.bands.replaceChildren();

  if (totalSteps <= 200) {
    for (let index = 0; index < totalSteps; index += 1) {
      const start = currentScale.min + index * currentScale.step;
      elements.bands.append(svg('rect', { x: xFor(start, currentScale), y: 82, width: xFor(start + currentScale.step, currentScale) - xFor(start, currentScale), height: 12, class: index % 2 ? 'band alternate' : 'band' }));
    }
  }

  const visibleEvery = Math.max(1, Math.ceil(totalSteps / 1200));
  for (let index = 0; index <= totalSteps; index += visibleEvery) {
    const value = currentScale.min + index * currentScale.step;
    const x = xFor(value, currentScale);
    const wholeMark = Math.abs(value - Math.round(value)) < currentScale.step / 2;
    const endpoint = index === 0 || index === totalSteps;
    if (!wholeMark && !endpoint) elements.ticks.append(svg('line', { x1: x, x2: x, y1: 76, y2: 101, class: 'tick' }));
  }
  for (let whole = Math.ceil(currentScale.min); whole <= Math.floor(currentScale.max); whole += 1) {
    const x = xFor(whole, currentScale);
    elements.ticks.append(svg('line', { x1: x, x2: x, y1: 68, y2: 109, class: 'tick endpoint' }));
    elements.ticks.append(svg('text', { x, y: 140, class: 'tick-label' }, state.mode === 'fraction' ? String(whole) : decimalLabel(whole)));
  }
  [currentScale.min, currentScale.max].forEach((endpoint) => {
    if (Math.abs(endpoint - Math.round(endpoint)) < currentScale.step / 2) return;
    const x = xFor(endpoint, currentScale);
    elements.ticks.append(svg('line', { x1: x, x2: x, y1: 68, y2: 109, class: 'tick endpoint' }));
    elements.ticks.append(svg('text', { x, y: 140, class: 'tick-label' }, decimalLabel(endpoint)));
  });

  const precision = Math.max(4, state.places);
  elements.slider.min = currentScale.min.toFixed(precision);
  elements.slider.max = currentScale.max.toFixed(precision);
  elements.slider.step = currentScale.step.toFixed(precision);
  if (resetSlider) state.sliderValue = currentScale.min;
  state.sliderValue = clamp(state.sliderValue, currentScale.min, currentScale.max);
  elements.slider.value = state.sliderValue;
  elements.slider.hidden = !state.support;
  elements.sliderValue.hidden = !state.support;
  updateSliderValue();

  elements.scaleText.textContent = state.mode === 'fraction'
    ? `${state.denominator} gleich große Abschnitte pro Ganzem`
    : `${state.decimalRange === 'excerpt' ? 'Ausschnitt' : 'Gesamter Bereich'} · Schrittweite ${decimalLabel(currentScale.step)}`;
}

function updateSliderValue() {
  const currentScale = scale();
  const ratio = (state.sliderValue - currentScale.min) / (currentScale.max - currentScale.min);
  elements.sliderValue.style.left = `${7 + ratio * 86}%`;
  elements.sliderValue.value = valueLabel(state.sliderValue);
  elements.slider.setAttribute('aria-valuetext', valueLabel(state.sliderValue));
}

function renderAll(resetSlider = false) {
  if (state.mode === 'fraction') renderParts();
  renderLine(resetSlider);
}

function openMode(mode) {
  state.mode = mode;
  elements.choice.hidden = true; elements.work.hidden = false;
  elements.title.textContent = mode === 'fraction' ? 'Bruch einstellen' : 'Dezimalbruch einstellen';
  elements.fractionSettings.hidden = mode !== 'fraction';
  elements.decimalSettings.hidden = mode !== 'decimal';
  renderAll(true);
}

document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => openMode(button.dataset.mode)));
$('#back').addEventListener('click', () => { elements.work.hidden = true; elements.choice.hidden = false; state.mode = null; });
$('#parts-minus').addEventListener('click', () => { state.denominator = clamp(state.denominator - 1, 2, 12); renderAll(true); });
$('#parts-plus').addEventListener('click', () => { state.denominator = clamp(state.denominator + 1, 2, 12); renderAll(true); });
$('#numerator-minus').addEventListener('click', () => { state.numerator = clamp(state.numerator - 1, 1, 60); renderAll(true); });
$('#numerator-plus').addEventListener('click', () => { state.numerator = clamp(state.numerator + 1, 1, 60); renderAll(true); });
elements.numeratorInput.addEventListener('change', () => { state.numerator = clamp(Number.parseInt(elements.numeratorInput.value, 10) || 1, 1, 60); renderAll(true); });
elements.partsInput.addEventListener('change', () => { state.denominator = clamp(Number.parseInt(elements.partsInput.value, 10) || 2, 2, 12); renderAll(true); });
elements.decimalInput.addEventListener('input', () => { state.decimal = decimalFromInput(); renderLine(true); });
document.querySelectorAll('[data-places]').forEach((button) => button.addEventListener('click', () => {
  state.places = Number(button.dataset.places);
  document.querySelectorAll('[data-places]').forEach((item) => item.classList.toggle('active', item === button));
  elements.decimalInput.value = decimalLabel(state.decimal);
  state.decimal = decimalFromInput();
  renderLine(true);
}));
document.querySelectorAll('[data-range]').forEach((button) => button.addEventListener('click', () => {
  state.decimalRange = button.dataset.range;
  document.querySelectorAll('[data-range]').forEach((item) => item.classList.toggle('active', item === button));
  renderLine(true);
}));
elements.support.addEventListener('change', () => { state.support = elements.support.checked; renderLine(false); });
elements.slider.addEventListener('input', () => { state.sliderValue = Number(elements.slider.value); updateSliderValue(); });
