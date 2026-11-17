# cristianoaad.github.io

Portfólio profissional de **Cristiano Diniz**: Advanced Analytics, Customer Experience & Voz do Cliente, Product Analytics e aplicações co-construídas com IA.

**No ar:** https://cristianoaad.github.io/ · versão em inglês: https://cristianoaad.github.io/?lang=en

## Estrutura

```
index.html            conteúdo (PT e EN lado a lado)
assets/css/style.css  tokens de cor, tema claro/escuro e layout
assets/js/main.js     idioma, tema, menu ativo e gráfico do TCC
assets/img/           imagens dos apps e imagem de compartilhamento (og-image.png)
favicon.svg
.nojekyll             publica os arquivos como estão, sem Jekyll
```

Site estático, sem etapa de build: HTML, CSS e JavaScript puros.

## Como editar

- **Textos:** todo trecho existe em dois idiomas, marcados com `data-l="pt"` e `data-l="en"`. Ao editar um, edite o par.
- **Idioma padrão:** português. Navegadores em outro idioma abrem em inglês, e `?lang=en` força o inglês (útil para candidaturas internacionais).
- **Cores:** variáveis no topo de `style.css` (`:root` para o tema claro, `[data-theme="dark"]` para o escuro).
- **Gráfico do TCC:** dados em `assets/js/main.js` (`F1` e `ACC`) e na tabela em `index.html`.

## Rodar localmente

```bash
python -m http.server 8765
```

Depois abra http://localhost:8765.

## Publicação

O GitHub Pages publica automaticamente a branch `main` deste repositório (`cristianoaad.github.io`).
