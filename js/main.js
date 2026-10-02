/**
 * main.js
 * Comportamentos da página do Armazém Minas Gerais:
 *  - menu mobile e cabeçalho com borda ao rolar
 *  - filtro do cardápio por categoria
 *  - lista lateral de destaques (abas acessíveis)
 *  - status "aberto/fechado agora" na caderneta de horários
 *  - troca de unidade (endereço + mapa)
 *  - formulário de encomenda que monta a mensagem do WhatsApp (com sanitização)
 *
 * Segurança: nenhum dado do usuário passa por innerHTML; textos vão por textContent
 * e a URL do WhatsApp é montada com encodeURIComponent.
 */

(() => {
  'use strict';

  /* ── Constantes ── */
  const WHATSAPP_NUMBER = '5535991234567';
  const TIME_ZONE = 'America/Sao_Paulo';

  // Horários por unidade: dia da semana (0 = domingo) → [abre, fecha] em horas
  const OPENING_HOURS = {
    centro: {
      0: null,
      1: [7, 19], 2: [7, 19], 3: [7, 19], 4: [7, 19], 5: [7, 19],
      6: [7, 14],
    },
    savassi: {
      0: [9, 14],
      1: [8, 21], 2: [8, 21], 3: [8, 21], 4: [8, 21],
      5: [8, 22], 6: [8, 22],
    },
  };

  // Mapas permitidos: a URL do iframe só pode assumir um destes valores
  const UNIT_MAPS = {
    centro: {
      label: 'Centro',
      src: 'https://www.google.com/maps?q=Rua+dos+Goitacazes+214,+Centro,+Belo+Horizonte+-+MG&output=embed',
    },
    savassi: {
      label: 'Savassi',
      src: 'https://www.google.com/maps?q=Rua+Pernambuco+1060,+Savassi,+Belo+Horizonte+-+MG&output=embed',
    },
  };

  /* ════════════════ CABEÇALHO E MENU ════════════════ */

  /**
   * Abre/fecha o menu mobile e fecha ao clicar em um link ou apertar Esc.
   */
  const initMobileMenu = () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('menu-principal');
    if (!toggle || !nav) return;

    const label = toggle.querySelector('.sr-only');

    // Aplica o estado aberto/fechado em todos os atributos relevantes
    const setOpen = (isOpen) => {
      nav.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (label) label.textContent = isOpen ? 'Fechar menu' : 'Abrir menu';
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  };

  /**
   * Adiciona a classe .is-scrolled no cabeçalho depois que a página rola.
   */
  const initHeaderScroll = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  /* ════════════════ CARDÁPIO ════════════════ */

  /**
   * Filtra as etiquetas do cardápio pela categoria escolhida nos chips.
   */
  const initMenuFilter = () => {
    const chips = document.querySelectorAll('.menu__filters .chip');
    const items = document.querySelectorAll('.menu__item');
    const emptyMessage = document.querySelector('.menu__empty');
    if (!chips.length || !items.length) return;

    // Mostra só os itens da categoria e atualiza o estado dos chips
    const applyFilter = (filter) => {
      let visibleCount = 0;

      items.forEach((item) => {
        const matches = filter === 'todos' || item.dataset.category === filter;
        item.hidden = !matches;
        if (matches) {
          visibleCount += 1;
          // Garante que itens revelados pelo filtro não fiquem invisíveis
          item.querySelectorAll('[data-anime]').forEach((el) => el.classList.add('anime'));
        }
      });

      chips.forEach((chip) => {
        const isActive = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });

      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
    });
  };

  /* ════════════════ DESTAQUES (abas) ════════════════ */

  /**
   * Lista lateral de destaques com o padrão de abas da WAI-ARIA:
   * clique/hover ativa, setas ↑ ↓ navegam, Home/End vão às pontas.
   */
  const initShelfTabs = () => {
    const tabs = Array.from(document.querySelectorAll('.shelf__tab'));
    if (!tabs.length) return;

    // Ativa a aba informada e mostra o painel correspondente
    const activate = (tab, moveFocus = false) => {
      tabs.forEach((current) => {
        const isActive = current === tab;
        const panel = document.getElementById(current.getAttribute('aria-controls'));

        current.classList.toggle('is-active', isActive);
        current.setAttribute('aria-selected', String(isActive));
        current.tabIndex = isActive ? 0 : -1;

        if (panel) {
          panel.hidden = !isActive;
          panel.classList.toggle('is-active', isActive);
        }
      });

      if (moveFocus) tab.focus();
    };

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));

      // No desktop, passar o mouse já troca o produto
      if (canHover) {
        tab.addEventListener('mouseenter', () => {
          if (!tab.classList.contains('is-active')) activate(tab);
        });
      }

      // Navegação por teclado entre as abas
      tab.addEventListener('keydown', (event) => {
        const keyMap = {
          ArrowDown: (index + 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          ArrowUp: (index - 1 + tabs.length) % tabs.length,
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        };
        if (!(event.key in keyMap)) return;
        event.preventDefault();
        activate(tabs[keyMap[event.key]], true);
      });
    });
  };

  /* ════════════════ HORÁRIO ════════════════ */

  /**
   * Retorna o dia da semana (0–6) e a hora decimal atuais no fuso de Belo Horizonte,
   * independente do fuso do aparelho do visitante.
   */
  const getLocalNow = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(new Date());

    const read = (type) => parts.find((part) => part.type === type)?.value;
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return {
      day: weekdays.indexOf(read('weekday')),
      hour: Number(read('hour')) + Number(read('minute')) / 60,
    };
  };

  /**
   * Formata uma hora decimal inteira como "19h".
   * @param {number} hour
   */
  const formatHour = (hour) => `${hour}h`;

  /**
   * Gera o texto de status de uma unidade: aberto até X / abre às Y.
   * @param {Object} schedule - horários da unidade
   * @param {{day:number, hour:number}} now
   */
  const describeStatus = (schedule, now) => {
    const today = schedule[now.day];

    if (today && now.hour >= today[0] && now.hour < today[1]) {
      return { open: true, text: `aberto agora · até ${formatHour(today[1])}` };
    }

    if (today && now.hour < today[0]) {
      return { open: false, text: `fechado · abre hoje às ${formatHour(today[0])}` };
    }

    // Procura o próximo dia com expediente
    for (let offset = 1; offset <= 7; offset += 1) {
      const nextDay = (now.day + offset) % 7;
      const next = schedule[nextDay];
      if (next) {
        const when = offset === 1 ? 'amanhã' : ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][nextDay];
        return { open: false, text: `fechado · abre ${when} às ${formatHour(next[0])}` };
      }
    }

    return { open: false, text: 'fechado' };
  };

  /**
   * Grifa o dia de hoje na caderneta e atualiza o status de cada unidade.
   */
  const initOpeningHours = () => {
    const update = () => {
      const now = getLocalNow();

      document.querySelectorAll('.notebook__table tbody tr').forEach((row) => {
        row.classList.toggle('is-today', Number(row.dataset.day) === now.day);
      });

      document.querySelectorAll('[data-status-unit]').forEach((item) => {
        const schedule = OPENING_HOURS[item.dataset.statusUnit];
        const textEl = item.querySelector('.status__text');
        if (!schedule || !textEl) return;

        const status = describeStatus(schedule, now);
        item.classList.toggle('is-open', status.open);
        item.classList.toggle('is-closed', !status.open);
        textEl.textContent = status.text;
      });
    };

    update();
    // Reavalia a cada minuto para virar o status sem recarregar
    window.setInterval(update, 60 * 1000);
  };

  /* ════════════════ CONTATO ════════════════ */

  let selectedUnit = 'centro';

  /**
   * Alterna entre as unidades, atualizando o mapa a partir da lista fixa UNIT_MAPS.
   */
  const initUnitSwitcher = () => {
    const buttons = document.querySelectorAll('.unit');
    const map = document.getElementById('mapa');
    if (!buttons.length || !map) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.unit;
        // Só aceita chaves conhecidas (nunca usa valor arbitrário no src)
        if (!Object.prototype.hasOwnProperty.call(UNIT_MAPS, key)) return;

        selectedUnit = key;
        buttons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle('is-active', isActive);
          other.setAttribute('aria-pressed', String(isActive));
        });

        map.src = UNIT_MAPS[key].src;
        map.title = `Mapa da unidade ${UNIT_MAPS[key].label} do Armazém Minas Gerais`;
      });
    });
  };

  /**
   * Limpa um texto digitado: remove caracteres de controle e sinais de marcação,
   * colapsa espaços e corta no tamanho máximo.
   * @param {string} value - texto bruto
   * @param {number} maxLength - limite de caracteres
   */
  const sanitizeText = (value, maxLength) => String(value ?? '')
    .normalize('NFC')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/[<>`{}]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);

  /**
   * Mostra uma mensagem de retorno no formulário (sempre via textContent).
   * @param {HTMLElement} el - elemento de feedback
   * @param {string} message - texto
   * @param {boolean} success - estilo de sucesso
   */
  const showFeedback = (el, message, success = false) => {
    el.textContent = message;
    el.classList.toggle('is-success', success);
  };

  /**
   * Valida o formulário de encomenda e abre o WhatsApp com a mensagem pronta.
   */
  const initOrderForm = () => {
    const form = document.getElementById('form-pedido');
    if (!form) return;

    const nameInput = form.elements.namedItem('nome');
    const orderInput = form.elements.namedItem('pedido');
    const feedback = document.getElementById('form-feedback');

    // Limpa o estado de erro quando o usuário volta a digitar
    [nameInput, orderInput].forEach((input) => {
      input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = sanitizeText(nameInput.value, 60);
      const order = sanitizeText(orderInput.value, 400);

      nameInput.toggleAttribute('aria-invalid', name.length < 2);
      orderInput.toggleAttribute('aria-invalid', order.length < 3);

      if (name.length < 2) {
        showFeedback(feedback, 'Conta pra gente seu nome.');
        nameInput.focus();
        return;
      }
      if (order.length < 3) {
        showFeedback(feedback, 'Escreve o que você vai querer.');
        orderInput.focus();
        return;
      }

      const unitLabel = UNIT_MAPS[selectedUnit].label;
      const message = `Olá, Armazém! Sou ${name}.\nQuero encomendar (unidade ${unitLabel}):\n${order}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      // Abre em nova aba via link temporário (window.open com noopener sempre retorna null)
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();

      showFeedback(feedback, 'Pronto! Abrimos o WhatsApp com seu pedido.', true);
      form.reset();
    });
  };

  /* ════════════════ RODAPÉ ════════════════ */

  /**
   * Atualiza o ano do copyright.
   */
  const initFooterYear = () => {
    const yearEl = document.getElementById('ano-atual');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  };

  /* ── Inicialização ── */
  initMobileMenu();
  initHeaderScroll();
  initMenuFilter();
  initShelfTabs();
  initOpeningHours();
  initUnitSwitcher();
  initOrderForm();
  initFooterYear();
})();
