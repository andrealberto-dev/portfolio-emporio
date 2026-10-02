/**
 * simple-anime.js
 * Animações de entrada disparadas pelo scroll.
 *
 * USO:
 *   <h1 data-anime="0" class="fadeInUp">Título</h1>
 *   <script src="components/simple-anime.js"></script>
 *   <script>new SimpleAnime();</script>
 *
 * - O valor de data-anime é o atraso (em ms) depois que o elemento entra na tela.
 * - A classe de direção (fadeInUp, fadeInLeft...) define o estado inicial.
 * - Quem prefere movimento reduzido vê tudo imediatamente.
 */

(function (global) {
  'use strict';

  class SimpleAnime {
    /**
     * Cria a instância e começa a observar os elementos [data-anime].
     * @param {Object} options - threshold e rootMargin do IntersectionObserver
     */
    constructor(options = {}) {
      this.items = document.querySelectorAll('[data-anime]');
      this.threshold = options.threshold ?? 0.15;
      this.rootMargin = options.rootMargin ?? '0px 0px -8% 0px';
      this.init();
    }

    /**
     * Aplica a classe .anime no elemento, respeitando o atraso do data-anime.
     * @param {Element} item - elemento a animar
     */
    animateItem(item) {
      const delay = Number(item.getAttribute('data-anime'));
      const safeDelay = Number.isFinite(delay) && delay > 0 ? delay : 0;
      setTimeout(() => item.classList.add('anime'), safeDelay);
    }

    /**
     * Mostra tudo sem animação (movimento reduzido ou navegador antigo).
     */
    revealAll() {
      this.items.forEach((item) => item.classList.add('anime'));
    }

    /**
     * Decide a estratégia: observar o scroll ou revelar tudo de uma vez.
     */
    init() {
      const reduceMotion = global.matchMedia &&
        global.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion || !('IntersectionObserver' in global)) {
        this.revealAll();
        return;
      }

      // Anima cada elemento uma única vez, quando ele entra na viewport
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.animateItem(entry.target);
          this.observer.unobserve(entry.target);
        });
      }, { threshold: this.threshold, rootMargin: this.rootMargin });

      this.items.forEach((item) => this.observer.observe(item));
    }
  }

  global.SimpleAnime = SimpleAnime;
})(window);
