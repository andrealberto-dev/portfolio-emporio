# prompt.md — Armazém Minas Gerais

> Leia o CLAUDE.md antes de qualquer código.
> Siga todas as convenções: Design (padrões PROIBIDOS) e Animations.

---

## Objetivo

Site portfólio único, animado e com identidade própria. Design original, sem padrões genéricos.

---

## Dados do comércio

- **Nome:** Armazém Minas Gerais
- **Nicho:** Lanchonete
- **Cidade:** Belo Horizonte - MG
- **Descrição:** Empório e mercearia mineira com queijos artesanais, linguiças caseiras, cachaças selecionadas, doces de leite e produtos típicos de Minas. Duas unidades em BH (Centro e Savassi). Atendimento familiar, ambiente rústico e aconchegante, produtos direto de pequenos produtores mineiros.
- **Instagram:** @armazémMG
- **WhatsApp:** https://wa.me/5535991234567

---

## Identidade visual

- **Estilo:** Rústico e aconchegante
- **Cor primária:** #7b4f2e → `--color-primary`
- **Cor secundária:** #f5efe0 → `--color-secondary`
- **Cor acento:** #c9973a → `--color-accent`
- **Fonte títulos:** Nunito → `--font-display`
- **Fonte corpo:** Lato → `--font-body`
- **Logo:** Não tem — criar logotipo tipográfico

---

## Fotos / assets

  - (sem fotos — usar Unsplash via URL)

## Imagens via URL
Usar Unsplash no src (w=1600 hero, w=800 galeria, w=400 cards). Nunca placeholders.

---

## Estrutura de arquivos

```
armazem-minas-gerais/
├── CLAUDE.md
├── .gitignore
├── prompt.md
├── index.html
├── components/
│   ├── simple-anime.js
│   ├── simple-anime.css
│   ├── origin-button.js
│   └── origin-button.css
├── css/
│   ├── variables.css
│   ├── global.css
│   ├── components.css
│   └── index.css
├── js/
│   └── main.js
└── assets/
    └── images/
```

---

## Seções e layouts

1. **hero** → Tipográfico (texto gigante)
2. **cardapio** → Cards com preço
3. **destaques** → Lista lateral
4. **horario**
5. **contato** → Split + mapa

---

## Requisitos

- Ler CLAUDE.md antes de qualquer código
- Mobile-first, 100% responsivo
- Cores via CSS custom properties em `css/variables.css`
- Nunca inline styles
- WhatsApp flutuante → https://wa.me/5535991234567
- Google Fonts: Nunito + Lato
- Comentários em português

## Animações (obrigatório)

No `<head>`:
```html
<link rel="stylesheet" href="components/simple-anime.css">
<link rel="stylesheet" href="components/origin-button.css">
```

Antes do `</body>`:
```html
<script src="components/simple-anime.js"></script>
<script src="components/origin-button.js"></script>
<script>new SimpleAnime();</script>
```

Adicionar `data-anime` em todos os elementos:
```html
<h1 data-anime="0" class="fadeInUp">Título</h1>
<p data-anime="200" class="fadeInUp">Subtítulo</p>
<button data-anime="400" class="fadeInUp origin-btn origin-btn-primary">CTA</button>
```

| Contexto | Botão |
|---|---|
| CTA principal, agendamento, WhatsApp | `origin-btn origin-btn-primary` |
| Botão secundário, "saiba mais" | `flow-btn` |
| Tema dourado | `origin-btn-gold` ou `flow-btn-gold` |
| Fundo escuro | `flow-btn-white` |

## SEO

```html
<title>Armazém Minas Gerais — Lanchonete em Belo Horizonte - MG</title>
<meta name="description" content="Empório e mercearia mineira com queijos artesanais, linguiças caseiras, cachaças selecionadas, doces de leite e produtos típicos de Minas. D" >
<meta name="keywords" content="lanchonete, Armazém Minas Gerais">
<meta property="og:title" content="Armazém Minas Gerais — Lanchonete em Belo Horizonte - MG">
<meta name="theme-color" content="#7b4f2e">
```


---
*Gerado em 02/10/2026 às 16:23*