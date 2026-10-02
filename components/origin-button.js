/**
 * origin-button.js
 * Efeito "Origin Button" — ripple que parte do cursor e preenche o botão
 * Adaptado do componente @lyanchouss/origin-button (21st.dev) para vanilla JS
 *
 * USO:
 *   1. Adicione a classe .origin-btn em qualquer botão
 *   2. Importe este JS e o CSS no final do <body>
 *
 * PERSONALIZAÇÃO via CSS variables no botão:
 *   --ob-fill-color   : cor do ripple (padrão: cor do texto/foreground)
 *   --ob-text-color   : cor do texto normal
 *   --ob-text-on-fill : cor do texto quando o ripple cobre o botão
 *   --ob-duration     : duração da animação (padrão: 500ms)
 */

(function () {
  'use strict';

  const FILL_DURATION = 500; // ms

  // Calcula o diâmetro mínimo para cobrir o botão inteiro a partir de (x, y)
  function getCoverDiameter(width, height, x, y) {
    return Math.ceil(
      2 *
        Math.max(
          Math.hypot(x, y),
          Math.hypot(width - x, y),
          Math.hypot(x, height - y),
          Math.hypot(width - x, height - y)
        )
    );
  }

  function initOriginButton(btn) {
    if (btn._originButtonInit) return;
    btn._originButtonInit = true;

    // Cria o elemento do ripple
    const ripple = document.createElement('span');
    ripple.setAttribute('aria-hidden', 'true');
    ripple.classList.add('ob-ripple');
    btn.appendChild(ripple);

    // Envolve o conteúdo original em um span z-10
    const content = document.createElement('span');
    content.classList.add('ob-content');
    Array.from(btn.childNodes).forEach(node => {
      if (node !== ripple) content.appendChild(node);
    });
    btn.insertBefore(content, ripple);

    let origin = { x: 0, y: 0 };
    let coverSize = 0;
    let hovered = false;
    let pressed = false;
    let fillTimeout = null;

    function updateOrigin(x, y) {
      const rect = btn.getBoundingClientRect();
      origin = { x, y };
      coverSize = getCoverDiameter(rect.width, rect.height, x, y);
    }

    function updateOriginFromPointer(e) {
      const rect = btn.getBoundingClientRect();
      updateOrigin(e.clientX - rect.left, e.clientY - rect.top);
    }

    function updateOriginFromCenter() {
      const rect = btn.getBoundingClientRect();
      updateOrigin(rect.width / 2, rect.height / 2);
    }

    function showFill() {
      const duration = parseInt(
        getComputedStyle(btn).getPropertyValue('--ob-duration') || FILL_DURATION
      );

      ripple.style.width  = coverSize + 'px';
      ripple.style.height = coverSize + 'px';
      ripple.style.left   = origin.x + 'px';
      ripple.style.top    = origin.y + 'px';
      ripple.style.transitionDuration = duration + 'ms';

      // Força reflow antes de escalar
      ripple.getBoundingClientRect();
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      btn.classList.add('ob-filled');
    }

    function hideFill() {
      const duration = parseInt(
        getComputedStyle(btn).getPropertyValue('--ob-duration') || FILL_DURATION
      );
      ripple.style.transitionDuration = duration + 'ms';
      ripple.style.transform = 'translate(-50%, -50%) scale(0)';
      btn.classList.remove('ob-filled');
    }

    function updateState() {
      if (hovered || pressed) {
        showFill();
      } else {
        hideFill();
      }
    }

    // Pointer events
    btn.addEventListener('pointerenter', (e) => {
      if (btn.disabled) return;
      updateOriginFromPointer(e);
      hovered = true;
      updateState();
    });

    btn.addEventListener('pointermove', (e) => {
      if (!hovered || btn.disabled) return;
      updateOriginFromPointer(e);
      // Atualiza a posição do ripple só se não estiver expandido
      if (!pressed) {
        ripple.style.left = origin.x + 'px';
        ripple.style.top  = origin.y + 'px';
        const rect = btn.getBoundingClientRect();
        coverSize = getCoverDiameter(rect.width, rect.height, origin.x, origin.y);
        ripple.style.width  = coverSize + 'px';
        ripple.style.height = coverSize + 'px';
      }
    });

    btn.addEventListener('pointerleave', () => {
      hovered = false;
      pressed = false;
      updateState();
    });

    btn.addEventListener('pointerdown', (e) => {
      if (btn.disabled || e.button !== 0) return;
      updateOriginFromPointer(e);
      pressed = true;
      hovered = true;
      updateState();
    });

    btn.addEventListener('pointerup', () => {
      pressed = false;
      updateState();
    });

    btn.addEventListener('pointercancel', () => {
      pressed = false;
      hovered = false;
      updateState();
    });

    // Teclado (acessibilidade)
    btn.addEventListener('keydown', (e) => {
      if (btn.disabled || e.repeat) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.key === ' ') e.preventDefault();
        updateOriginFromCenter();
        pressed = true;
        hovered = true;
        updateState();
      }
    });

    btn.addEventListener('keyup', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        pressed = false;
        if (!btn.matches(':focus-visible')) hovered = false;
        updateState();
      }
    });

    btn.addEventListener('blur', () => {
      pressed = false;
      hovered = false;
      updateState();
    });

    btn.addEventListener('focus', (e) => {
      if (btn.disabled) return;
      if (btn.matches(':focus-visible')) {
        updateOriginFromCenter();
        hovered = true;
        updateState();
      }
    });
  }

  // Inicializa todos os .origin-btn existentes e observa novos
  function initAll() {
    document.querySelectorAll('.origin-btn').forEach(initOriginButton);
  }

  // MutationObserver para botões adicionados dinamicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('.origin-btn')) initOriginButton(node);
        node.querySelectorAll?.('.origin-btn').forEach(initOriginButton);
      });
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAll();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    initAll();
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();

/* ─── Flow Button ─────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const ARROW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

  function initFlowButton(btn) {
    if (btn._flowButtonInit) return;
    btn._flowButtonInit = true;

    // Pega o texto original
    const originalText = btn.textContent.trim();
    btn.innerHTML = '';

    // Seta esquerda
    const arrLeft = document.createElement('span');
    arrLeft.className = 'flow-arr-left';
    arrLeft.innerHTML = ARROW_SVG;
    arrLeft.querySelector('svg').style.cssText = 'width:16px;height:16px;display:block';

    // Texto
    const textSpan = document.createElement('span');
    textSpan.className = 'flow-text';
    textSpan.textContent = originalText;

    // Círculo
    const circle = document.createElement('span');
    circle.className = 'flow-circle';
    circle.setAttribute('aria-hidden', 'true');

    // Seta direita
    const arrRight = document.createElement('span');
    arrRight.className = 'flow-arr-right';
    arrRight.innerHTML = ARROW_SVG;
    arrRight.querySelector('svg').style.cssText = 'width:16px;height:16px;display:block';

    btn.appendChild(arrLeft);
    btn.appendChild(textSpan);
    btn.appendChild(circle);
    btn.appendChild(arrRight);
  }

  function initAllFlow() {
    document.querySelectorAll('.flow-btn').forEach(initFlowButton);
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.matches?.('.flow-btn')) initFlowButton(node);
        node.querySelectorAll?.('.flow-btn').forEach(initFlowButton);
      });
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAllFlow();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    initAllFlow();
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
