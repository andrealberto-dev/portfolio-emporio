# CLAUDE.md — Developer Instructions

## Stack
- HTML5 + CSS3 + Vanilla JavaScript (no frameworks, no external libraries)
- Três scripts de animação próprios (veja abaixo)

## Folder structure
project/
├── pages/
├── components/             # ← copiar esta pasta em todo projeto
│   ├── simple-anime.js     # animações de entrada (scroll)
│   ├── simple-anime.css
│   ├── origin-button.js    # efeitos de botão (origin + flow)
│   └── origin-button.css
├── css/
│   ├── global.css          # resets, base styles
│   ├── variables.css       # colors, typography tokens
│   ├── components.css      # reusable component styles
│   └── [page].css          # page-specific styles
├── js/
│   └── [feature].js
├── assets/
│   ├── images/
│   └── fonts/
└── components/ui/          # componentes do 21st.dev

## CSS conventions
- Always separate: variables → global → components → page-specific
- Define all colors and typography in variables.css using CSS custom properties
- Never use inline styles
- Mobile-first responsive design

## Code conventions
- File naming: camelCase (ex: heroSection.css, formHandler.js)
- Always comment code blocks explaining purpose
- Arrow functions preferred in JS
- Descriptive variable and function names in English
- Comments in Portuguese

---

## Animations — SimpleAnime (animações de entrada)

Usar SimpleAnime para TODAS as animações de entrada ao scrollar.
NÃO usar GSAP nem outras bibliotecas de animação.

### Setup (no final do `<body>`)
```html
<link rel="stylesheet" href="components/simple-anime.css">
<link rel="stylesheet" href="components/origin-button.css">

<script src="components/simple-anime.js"></script>
<script src="components/origin-button.js"></script>
<script>new SimpleAnime();</script>
```

### Como usar
```html
<!-- Delay em ms no atributo data-anime -->
<h1 data-anime="0">Título</h1>
<p data-anime="200" class="fadeInUp">Subtítulo</p>
<button data-anime="400" class="fadeInUp">CTA</button>

<!-- Cards com stagger manual -->
<div data-anime="100" class="fadeInUp">Card 1</div>
<div data-anime="250" class="fadeInUp">Card 2</div>
<div data-anime="400" class="fadeInUp">Card 3</div>
```

### Classes de direção disponíveis
| Classe | Efeito |
|---|---|
| `fadeInUp` | sobe de baixo para cima (padrão para a maioria) |
| `fadeInDown` | desce de cima para baixo (nav, headers) |
| `fadeInLeft` | entra da esquerda |
| `fadeInRight` | entra da direita |
| `fadeInScale` | cresce de 92% para 100% |
| `fadeInSlightUp` | sobe levemente (para textos e imagens) |

### Padrões obrigatórios por seção
- **Hero:** título `data-anime="0"`, subtítulo `data-anime="200"`, CTA `data-anime="400"` — todos com `fadeInUp`
- **Seções:** título da seção `data-anime="0"`, elementos filhos com stagger de 150ms
- **Cards:** stagger de 150ms entre cada card (100, 250, 400...)
- **Imagens:** `data-anime="200" class="fadeInScale"`

---

## Button animations — dois efeitos, use o certo para cada contexto

NUNCA use CSS transition simples para botões — sempre use um dos dois efeitos abaixo.

### 1. Origin Button — `.origin-btn`
**O que faz:** ripple parte do cursor e expande cobrindo o botão inteiro.

**Quando usar:**
- CTA principal do Hero
- Botão de agendamento / contato
- Botão flutuante de WhatsApp
- Ação mais importante da página

```html
<button class="origin-btn origin-btn-primary">Agendar agora</button>
<button class="origin-btn origin-btn-gold">Ver serviços</button>
<button class="origin-btn origin-btn-whatsapp">💬 WhatsApp</button>
```

**Variantes:** `.origin-btn-primary` · `.origin-btn-gold` · `.origin-btn-outline` · `.origin-btn-whatsapp`

**Personalização:**
```css
.meu-botao {
  --ob-fill-color:   #C9A84C;
  --ob-text-on-fill: #111;
  --ob-duration:     400;
  --ob-radius:       8px;
}
```

---

### 2. Flow Button — `.flow-btn`
**O que faz:** seta entra pela esquerda, texto desloca, círculo expande do centro, seta direita sai.

**Quando usar:**
- Botões secundários ("Saiba mais", "Ver portfólio")
- Links de seção ("Conheça nossos serviços")
- Cards de serviço com CTA

```html
<button class="flow-btn">Ver portfólio</button>
<button class="flow-btn flow-btn-gold">Nossos serviços</button>
<button class="flow-btn flow-btn-white">Saiba mais</button>
```

**Variantes:** `.flow-btn` · `.flow-btn-gold` · `.flow-btn-white`

**Personalização:**
```css
.meu-flow {
  --flow-bg:         #C9A84C;
  --flow-text:       #C9A84C;
  --flow-text-hover: #111;
}
```

---

### Regra de escolha
| Contexto | Efeito |
|---|---|
| CTA principal, botão de destaque | `.origin-btn` |
| Botão secundário, "saiba mais" | `.flow-btn` |
| WhatsApp, agendamento | `.origin-btn-whatsapp` |
| Fundo escuro | `.flow-btn-white` ou `.origin-btn-gold` |
| Tema dourado (barbearia, salão) | `.origin-btn-gold` ou `.flow-btn-gold` |

---

## Images — stock photos via URL
- Use Unsplash diretamente no src (sem download)
- Hero: `?w=1600&q=85` | Galeria: `?w=800&q=75` | Cards: `?w=400&q=70`
- Nunca usar placeholders
- Alt descritivo em todo `<img>`

## 21st.dev components
- Paste component code into /components/ui/
- Adapt to vanilla JS (remove React/JSX syntax)
- Keep original structure, only adjust to match project variables

## Design — CRITICAL
Every site must feel unique. The following patterns are FORBIDDEN:

### Forbidden layout patterns
- Hero with full-width background image + dark overlay + centered text
- Alternating sections (text left/image right repeating)
- Icon + centered title + paragraph cards in 3-column grid
- Symmetric layouts where every section looks the same
- Generic "About Us" with photo + bullet points
- Footer with 3 equal columns

### Forbidden UI patterns
- Rounded cards with drop shadows as the only visual element
- All buttons looking the same
- Section titles always centered with colored underline
- Progress bars to represent services
- Testimonials in identical quote cards with stars

### What makes a site feel unique
- Asymmetric layouts that break the grid intentionally
- Typographic hierarchy that varies between sections
- At least one unexpected section for the niche
- Images that overlap text or other elements
- Rhythm: wide → narrow → full bleed → split

## Security — TOP PRIORITY
- Sanitize ALL user inputs
- Never expose sensitive data in client-side JS
- Prevent XSS: never use innerHTML with user data
- HTTPS only for external resources
- No hardcoded credentials or API keys

## Documentation
- Every file must have a header comment explaining its purpose
- Every function must have a comment explaining what it does
- Complex logic must have inline comments
