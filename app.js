/* fraction-pizza app.js - 100% Vanilla JavaScript & Web Audio API Engine */
(function () {
  'use strict';

  // State Management
  const state = {
    mode: 'compare', // 'compare', 'addition'
    pizza1: {
      denom: 4,
      num: 2,
      selectedSlices: new Set([0, 1])
    },
    pizza2: {
      denom: 8,
      num: 4,
      selectedSlices: new Set([0, 1, 2, 3])
    },
    audioEnabled: true
  };

  // Math Utilities
  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
  }

  // Web Audio Synth Engine
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.15, vol = 0.15) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function playSliceChime(sliceIndex, totalSlices) {
    const baseFreq = 320;
    const ratio = Math.pow(2, (sliceIndex % 12) / 12);
    playTone(baseFreq * ratio, 'triangle', 0.18, 0.12);
  }

  function playSuccessChord() {
    setTimeout(() => playTone(523.25, 'sine', 0.3, 0.15), 0);   // C5
    setTimeout(() => playTone(659.25, 'sine', 0.3, 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.4, 0.2), 200);  // G5
  }

  // SVG Geometry Calculator
  function calculateSlicePath(cx, cy, r, startAngleDeg, endAngleDeg) {
    const startRad = (startAngleDeg - 90) * Math.PI / 180;
    const endRad = (endAngleDeg - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = (endAngleDeg - startAngleDeg) > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  // Pizza SVG Renderer
  function renderPizza(svgId, pizzaData, pizzaKey) {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    svg.innerHTML = '';

    const cx = 150;
    const cy = 150;
    const radius = 120;
    const crustRadius = 132;
    const denom = pizzaData.denom;

    // Outer Crust Background
    const crust = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    crust.setAttribute('cx', cx);
    crust.setAttribute('cy', cy);
    crust.setAttribute('r', crustRadius);
    crust.setAttribute('fill', '#d97706');
    crust.setAttribute('stroke', '#b45309');
    crust.setAttribute('stroke-width', '4');
    svg.appendChild(crust);

    // Inner Base Circle (Empty Dough)
    const base = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    base.setAttribute('cx', cx);
    base.setAttribute('cy', cy);
    base.setAttribute('r', radius);
    base.setAttribute('fill', '#fde68a');
    svg.appendChild(base);

    // Group for slices
    const sliceAngle = 360 / denom;
    for (let i = 0; i < denom; i++) {
      const startDeg = i * sliceAngle;
      const endDeg = (i + 1) * sliceAngle;
      const isSelected = pizzaData.selectedSlices.has(i);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', calculateSlicePath(cx, cy, radius, startDeg, endDeg));
      path.setAttribute('class', `slice-path ${isSelected ? 'selected' : ''}`);
      path.setAttribute('data-index', i);

      if (isSelected) {
        path.setAttribute('fill', pizzaKey === 'pizza1' ? '#f97316' : '#3b82f6');
        path.setAttribute('stroke', '#ffffff');
        path.setAttribute('stroke-width', '2.5');
      } else {
        path.setAttribute('fill', 'transparent');
        path.setAttribute('stroke', '#cbd5e1');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-dasharray', denom > 8 ? '2,2' : 'none');
      }

      // Add Pepperoni topping dots for visual delight if selected
      if (isSelected && denom <= 12) {
        const midRad = ((startDeg + endDeg) / 2 - 90) * Math.PI / 180;
        const dotR = radius * 0.65;
        const dotX = cx + dotR * Math.cos(midRad);
        const dotY = cy + dotR * Math.sin(midRad);
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', dotX);
        dot.setAttribute('cy', dotY);
        dot.setAttribute('r', Math.max(4, 18 / Math.sqrt(denom)));
        dot.setAttribute('fill', '#dc2626');
        dot.setAttribute('opacity', '0.85');
        dot.style.pointerEvents = 'none';
        svg.appendChild(path);
        svg.appendChild(dot);
      } else {
        svg.appendChild(path);
      }

      // Interaction: Click / Touch Toggle Slice
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSlice(pizzaKey, i);
      });
    }

    // Center decorative hub
    const hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hub.setAttribute('cx', cx);
    hub.setAttribute('cy', cy);
    hub.setAttribute('r', 8);
    hub.setAttribute('fill', '#78350f');
    svg.appendChild(hub);
  }

  function toggleSlice(pizzaKey, index) {
    const p = state[pizzaKey];
    if (p.selectedSlices.has(index)) {
      p.selectedSlices.delete(index);
    } else {
      p.selectedSlices.add(index);
      playSliceChime(index, p.denom);
    }
    p.num = p.selectedSlices.size;
    updateUI();
  }

  function setNumerator(pizzaKey, num) {
    const p = state[pizzaKey];
    p.num = Math.max(0, Math.min(p.denom, num));
    p.selectedSlices.clear();
    for (let i = 0; i < p.num; i++) {
      p.selectedSlices.add(i);
    }
    playSliceChime(p.num, p.denom);
    updateUI();
  }

  function setDenominator(pizzaKey, denom) {
    const p = state[pizzaKey];
    const prevRatio = p.denom > 0 ? p.num / p.denom : 0;
    p.denom = Math.max(1, Math.min(16, denom));
    p.num = Math.round(prevRatio * p.denom);
    p.selectedSlices.clear();
    for (let i = 0; i < p.num; i++) {
      p.selectedSlices.add(i);
    }
    playTone(440, 'sine', 0.15, 0.1);
    updateUI();
  }

  // Update All Visual Components & Explanations
  function updateUI() {
    // 1. Render Pizza SVG
    renderPizza('pizza-svg-1', state.pizza1, 'pizza1');
    renderPizza('pizza-svg-2', state.pizza2, 'pizza2');

    // 2. Update Numerical Badges & Inputs (Pizza 1)
    document.getElementById('num-val-1').textContent = state.pizza1.num;
    document.getElementById('denom-val-1').textContent = state.pizza1.denom;
    document.getElementById('dec-val-1').textContent = (state.pizza1.num / state.pizza1.denom).toFixed(3);
    document.getElementById('slider-denom-1').value = state.pizza1.denom;
    document.getElementById('slider-num-1').value = state.pizza1.num;
    document.getElementById('slider-num-1').max = state.pizza1.denom;
    const dl1 = document.getElementById('denom-label-1'); if (dl1) dl1.textContent = state.pizza1.denom + '등분';
    const bn1 = document.getElementById('bal-num-1'); if (bn1) bn1.textContent = state.pizza1.num;
    const bd1 = document.getElementById('bal-denom-1'); if (bd1) bd1.textContent = state.pizza1.denom;

    // 2. Update Numerical Badges & Inputs (Pizza 2)
    document.getElementById('num-val-2').textContent = state.pizza2.num;
    document.getElementById('denom-val-2').textContent = state.pizza2.denom;
    document.getElementById('dec-val-2').textContent = (state.pizza2.num / state.pizza2.denom).toFixed(3);
    document.getElementById('slider-denom-2').value = state.pizza2.denom;
    document.getElementById('slider-num-2').value = state.pizza2.num;
    document.getElementById('slider-num-2').max = state.pizza2.denom;
    const dl2 = document.getElementById('denom-label-2'); if (dl2) dl2.textContent = state.pizza2.denom + '등분';
    const bn2 = document.getElementById('bal-num-2'); if (bn2) bn2.textContent = state.pizza2.num;
    const bd2 = document.getElementById('bal-denom-2'); if (bd2) bd2.textContent = state.pizza2.denom;

    // 3. Update Quick Chip Buttons active states
    document.querySelectorAll('[data-pizza="pizza1"][data-chip]').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.chip) === state.pizza1.denom);
    });
    document.querySelectorAll('[data-pizza="pizza2"][data-chip]').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.chip) === state.pizza2.denom);
    });

    // 4. Comparison & Addition Mode Verdict
    const v1 = state.pizza1.num / state.pizza1.denom;
    const v2 = state.pizza2.num / state.pizza2.denom;
    const balanceSymbol = document.getElementById('balance-symbol');
    const balanceVerdict = document.getElementById('balance-verdict');
    const stepContent = document.getElementById('step-content');

    const commonDenom = lcm(state.pizza1.denom, state.pizza2.denom);
    const convertedNum1 = state.pizza1.num * (commonDenom / state.pizza1.denom);
    const convertedNum2 = state.pizza2.num * (commonDenom / state.pizza2.denom);

    if (state.mode === 'compare') {
      if (Math.abs(v1 - v2) < 0.00001) {
        balanceSymbol.textContent = '=';
        balanceSymbol.style.color = '#10b981';
        balanceVerdict.className = 'balance-verdict verdict-equal';
        balanceVerdict.innerHTML = `🎉 두 분수는 크기가 정확히 같습니다! (동치분수: ${state.pizza1.num}/${state.pizza1.denom} = ${state.pizza2.num}/${state.pizza2.denom})`;
        playSuccessChord();
      } else if (v1 > v2) {
        balanceSymbol.textContent = '>';
        balanceSymbol.style.color = '#f97316';
        balanceVerdict.className = 'balance-verdict verdict-diff';
        balanceVerdict.innerHTML = `좌측 피자(${state.pizza1.num}/${state.pizza1.denom})가 우측 피자(${state.pizza2.num}/${state.pizza2.denom})보다 <strong>${(v1 - v2).toFixed(3)}</strong> 더 큽니다.`;
      } else {
        balanceSymbol.textContent = '<';
        balanceSymbol.style.color = '#3b82f6';
        balanceVerdict.className = 'balance-verdict verdict-diff';
        balanceVerdict.innerHTML = `우측 피자(${state.pizza2.num}/${state.pizza2.denom})가 좌측 피자(${state.pizza1.num}/${state.pizza1.denom})보다 <strong>${(v2 - v1).toFixed(3)}</strong> 더 큽니다.`;
      }

      stepContent.innerHTML = `
        <div style="line-height: 1.8;">
          <strong>[단계별 통분 원리 돋보기]</strong><br>
          1. 두 분모 <strong>${state.pizza1.denom}</strong>과 <strong>${state.pizza2.denom}</strong>의 최소공배수는 <strong>${commonDenom}</strong>입니다.<br>
          2. 피자 A: <span class="fraction-display" style="font-size:0.95rem;color:#ea580c;"><span class="fraction-numerator">${state.pizza1.num}</span><span class="fraction-denominator">${state.pizza1.denom}</span></span> = <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${state.pizza1.num} × ${commonDenom / state.pizza1.denom}</span><span class="fraction-denominator">${state.pizza1.denom} × ${commonDenom / state.pizza1.denom}</span></span> = <span class="fraction-display" style="font-size:0.95rem;color:#ea580c;"><span class="fraction-numerator"><strong>${convertedNum1}</strong></span><span class="fraction-denominator"><strong>${commonDenom}</strong></span></span><br>
          3. 피자 B: <span class="fraction-display" style="font-size:0.95rem;color:#2563eb;"><span class="fraction-numerator">${state.pizza2.num}</span><span class="fraction-denominator">${state.pizza2.denom}</span></span> = <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${state.pizza2.num} × ${commonDenom / state.pizza2.denom}</span><span class="fraction-denominator">${state.pizza2.denom} × ${commonDenom / state.pizza2.denom}</span></span> = <span class="fraction-display" style="font-size:0.95rem;color:#2563eb;"><span class="fraction-numerator"><strong>${convertedNum2}</strong></span><span class="fraction-denominator"><strong>${commonDenom}</strong></span></span><br>
          4. 두 피자를 모두 똑같이 <strong>${commonDenom}조각</strong>으로 나누었을 때, 토핑 조각 수는 각각 <strong>${convertedNum1}조각</strong>과 <strong>${convertedNum2}조각</strong>이므로 크기를 명확히 비교할 수 있습니다!
        </div>
      `;
    } else if (state.mode === 'addition') {
      const sumNum = convertedNum1 + convertedNum2;
      const g = gcd(sumNum, commonDenom);
      const simpNum = sumNum / g;
      const simpDenom = commonDenom / g;

      balanceSymbol.textContent = '+';
      balanceSymbol.style.color = '#8b5cf6';
      balanceVerdict.className = 'balance-verdict verdict-equal';
      balanceVerdict.innerHTML = `
        합계: <span class="fraction-display" style="font-size:1.1rem;"><span class="fraction-numerator">${state.pizza1.num}</span><span class="fraction-denominator">${state.pizza1.denom}</span></span> + <span class="fraction-display" style="font-size:1.1rem;"><span class="fraction-numerator">${state.pizza2.num}</span><span class="fraction-denominator">${state.pizza2.denom}</span></span> = <span class="fraction-display" style="font-size:1.1rem;color:#8b5cf6;"><span class="fraction-numerator"><strong>${sumNum}</strong></span><span class="fraction-denominator"><strong>${commonDenom}</strong></span></span> (기약분수: <span class="fraction-display" style="font-size:1.1rem;color:#10b981;"><span class="fraction-numerator"><strong>${simpNum}</strong></span><span class="fraction-denominator"><strong>${simpDenom}</strong></span></span> 또는 ${(sumNum / commonDenom).toFixed(3)}판)
      `;

      stepContent.innerHTML = `
        <div style="line-height: 1.8;">
          <strong>[분수 덧셈 통분 공식 단계별 풀이]</strong><br>
          <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${state.pizza1.num}</span><span class="fraction-denominator">${state.pizza1.denom}</span></span> + <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${state.pizza2.num}</span><span class="fraction-denominator">${state.pizza2.denom}</span></span>
          = <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${convertedNum1}</span><span class="fraction-denominator">${commonDenom}</span></span> + <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${convertedNum2}</span><span class="fraction-denominator">${commonDenom}</span></span>
          = <span class="fraction-display" style="font-size:0.95rem;"><span class="fraction-numerator">${convertedNum1} + ${convertedNum2}</span><span class="fraction-denominator">${commonDenom}</span></span>
          = <span class="fraction-display" style="font-size:0.95rem;color:#8b5cf6;"><span class="fraction-numerator"><strong>${sumNum}</strong></span><span class="fraction-denominator"><strong>${commonDenom}</strong></span></span>
        </div>
      `;
    }
  }

  // Event Listeners Binding
  function initEvents() {
    // Mode Tabs
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.mode = btn.dataset.mode;
        updateUI();
      });
    });

    // Sliders
    document.getElementById('slider-denom-1').addEventListener('input', (e) => setDenominator('pizza1', parseInt(e.target.value)));
    document.getElementById('slider-num-1').addEventListener('input', (e) => setNumerator('pizza1', parseInt(e.target.value)));
    document.getElementById('slider-denom-2').addEventListener('input', (e) => setDenominator('pizza2', parseInt(e.target.value)));
    document.getElementById('slider-num-2').addEventListener('input', (e) => setNumerator('pizza2', parseInt(e.target.value)));

    // Steppers
    document.getElementById('btn-num-minus-1').addEventListener('click', () => setNumerator('pizza1', state.pizza1.num - 1));
    document.getElementById('btn-num-plus-1').addEventListener('click', () => setNumerator('pizza1', state.pizza1.num + 1));
    document.getElementById('btn-num-minus-2').addEventListener('click', () => setNumerator('pizza2', state.pizza2.num - 1));
    document.getElementById('btn-num-plus-2').addEventListener('click', () => setNumerator('pizza2', state.pizza2.num + 1));

    // Quick Denominator Chips
    document.querySelectorAll('[data-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pKey = btn.dataset.pizza;
        setDenominator(pKey, parseInt(btn.dataset.chip));
      });
    });

    // Preset Challenge Buttons
    const btnPres1 = document.getElementById('btn-preset-half');
    if (btnPres1) {
      btnPres1.addEventListener('click', () => {
        state.pizza1.denom = 2; state.pizza1.num = 1;
        state.pizza2.denom = 4; state.pizza2.num = 2;
        setNumerator('pizza1', 1);
        setNumerator('pizza2', 2);
      });
    }
    const btnPres2 = document.getElementById('btn-preset-third');
    if (btnPres2) {
      btnPres2.addEventListener('click', () => {
        state.pizza1.denom = 3; state.pizza1.num = 1;
        state.pizza2.denom = 6; state.pizza2.num = 2;
        setNumerator('pizza1', 1);
        setNumerator('pizza2', 2);
      });
    }
  }

  // DOM Loaded Entrypoint
  window.addEventListener('DOMContentLoaded', () => {
    initEvents();
    updateUI();
  });
})();
