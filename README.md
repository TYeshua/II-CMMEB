# II CMMEB 2027 — site

Landing page do II Congresso de Ciências do Mar na Margem Equatorial Brasileira.
React + TypeScript + Tailwind CSS 4 + Vite, com cenas 3D em Three.js.

Foco: a indústria de óleo e gás na Margem Equatorial, com o meio ambiente ao redor dela.
Todo o 3D é em pontilhismo:

- **Carregamento:** uma tela leve, sem 3D, mostra o progresso real da montagem da cena (mapa, costa, pontos,
  shaders). O voo só começa quando tudo está pronto.
- **Voo:** um único plano-sequência. O planeta (~170 mil pontos) gira até a Margem Equatorial; a câmera desce
  sobre o mapa da margem (o Pará em destaque, Salinópolis e as cinco bacias da ANP com nome), desce
  sobre a costa real, com isóbatas pontilhadas, e termina no enquadramento da tela inicial: a plataforma no centro
  e o ambiente em órbita. O texto da página só aparece no fim. Rolar, tocar, teclar ou "Pular animação" leva ao fim.
- **Hero:** a plataforma fica no centro, e o ambiente (manguezal, recifes, guarás, pesca e
  comunidades) orbita ao redor. Ao rolar, a câmera desce pelo riser.
- **Descida pela página:** depois da tela inicial, a cena fica fixa ao fundo e a câmera acompanha a broca de uma
  coluna de perfuração que desce com a rolagem: água, cardumes, o BOP no leito e, no rodapé, a broca entrando nas
  camadas de rocha. O conteúdo ocupa ~2/3 da tela em cards de vidro fosco na cor de cada bloco (`--glass`, vindo do
  `data-bg`); o terço livre fica para a coluna. Em três idas e voltas os cards trocam de lado com a coluna (ids em
  `RIGHT_CARDS`, no Hero, e no CSS). O rodapé ocupa a largura toda, em vermelho que se desfaz em pontos sobre a
  formação (`.foot-dissolve`). Profundidades exibidas são ilustrativas.

## Como rodar

    npm install
    npm run dev       # desenvolvimento
    npm run build     # gera dist/
    npm run preview   # serve o build de produção (em /II-CMMEB/)
    npm run deploy    # publica dist/ na branch gh-pages (GitHub Pages)

Publicado em https://tyeshua.github.io/II-CMMEB/ (`base` no `vite.config.ts`). A imagem de prévia dos
links é `public/og.jpg` (a marca em pontilhismo, 1200×630), declarada nas tags `og:` do `index.html`.

## Onde editar

- `src/data/content.ts` — conteúdo fixo (transecto, bacias, palestrantes 2024, perguntas, créditos) e
  `PLACEHOLDERS`, a lista dos espaços [n] ainda vazios.
- `src/components/Ph.tsx` — desenha um espaço [n]. Para preencher, troque o `<Ph id="..." />` pelo
  conteúdo final e apague a linha correspondente em `PLACEHOLDERS` (a numeração se ajusta sozinha).
- `src/index.css` — cores (paleta original em `@theme`), escala tipográfica (`--step-*`) e componentes.
- `src/three/dots.ts` — o material de pontos usado em todo o 3D (ondas, asas e chama no shader).
- `src/three/models.ts` — plataforma, manguezal, recife, guarás, cardume e canoa, amostrados em pontos.
- `src/three/World.ts` — a cena inteira: planeta, margem, plataforma, órbita, mergulho pela rolagem.
  O "lugar" da plataforma é um grupo tangente ao globo, em unidades próprias reduzidas por `S`.
- `src/three/drill.ts` — coluna de perfuração, riser, BOP, broca, cascalho, leito, camadas de rocha e coluna d'água.
- `src/three/geo.ts` — projeção no globo, máscaras de terra e batimetria esquemática pela distância à costa.
- `src/three/margin-mask.json` e `margin-regions.json` — costa (Natural Earth 1:50m, domínio público), estados
  (IBGE, API de malhas) e as cinco bacias marítimas da margem (ANP, GeoMaps), gerados por `npm run mask`
  (`scripts/build-mask.mjs`, dados de origem em `scripts/data/`). O planeta usa `world-atlas` 1:110m.
- `src/three/fx.ts` — brilho (bloom) usado na introdução e no hero.
- `src/three/BasinMap.ts` + `terrain.ts` — mapa 3D das cinco bacias (relevo esquemático, fora de escala).
- Estrutura: **No centro, a indústria** (`Basins.tsx`, bacias e mapa 3D) → **Ao redor, a margem** (`Transect.tsx`)
  → **Em órbita, o ambiente** (`Environment.tsx`, dados em `content.ts → habitats`). `OrbitMark.tsx` marca o anel de cada parte.
- `src/components/ProfileArt.tsx` — ilustração do perfil costa → bacia usada na margem e no recife.
- `src/lib/tide.ts` — simulação de maré na costa de Salinópolis (modelo harmônico simplificado, sem calibração).

## Comportamentos

- A maré "agora" (hero e seção Local) é calculada no navegador e muda o nível do mar na cena 3D.
- Rolar, tocar ou usar o teclado pula a introdução. Na mesma sessão, ela roda mais rápido na segunda vez.
- Com `prefers-reduced-motion`, a introdução não aparece e as cenas 3D ficam estáticas.
- Sem WebGL, o hero e o mapa mostram um fundo de cor e o conteúdo continua completo.

## Espaços a preencher

Tudo o que ainda não foi definido para 2027 aparece na página como [n]. Ficaram os fatos de 2023 e 2024
(histórico, line-up e realizadores) e a geografia da margem.

| n | O que entra | id |
| --- | --- | --- |
| 1 | Datas do congresso | `datas` |
| 2 | Ementa do eixo central: a indústria de óleo e gás na Margem Equatorial | `eixo-central` |
| 3–9 | Eixo temático: título e ementa (sete eixos em órbita) | `eixo-1` … `eixo-7` |
| 10–15 | Palestrante 2027: nome, instituição e tema | `pal-1` … `pal-6` |
| 16 | Conferência de abertura: palestrante e tema | `prog-abertura` |
| 17 | Sessões temáticas: dias, horários e eixos | `prog-sessoes` |
| 18 | Mesas-redondas: temas e participantes | `prog-mesas` |
| 19 | Sessões de pôsteres: dias e local | `prog-posteres` |
| 20 | Encerramento e premiação | `prog-encerramento` |
| 21 | Grade completa por dia, com horários e salas | `prog-grade` |
| 22 | Normas de submissão, modelo de resumo e critérios de avaliação | `sub-normas` |
| 23 | Prazo de submissão | `sub-prazo` |
| 24 | Categorias de inscrição e valores | `insc-categorias` |
| 25 | Abertura das inscrições | `insc-abertura` |
| 26 | Link do sistema de inscrição | `insc-link` |
| 27 | Resultado da avaliação dos trabalhos | `resultado` |
| 28 | Espaço do evento: nome e endereço | `local` |
| 29 | E-mail e telefone da comissão organizadora | `contato` |
| 30 | Realização e apoio da edição 2027 | `realizacao-2027` |
| 31 | Cotas de patrocínio e contato comercial | `patrocinio` |
| 32–36 | Respostas das perguntas frequentes | `faq-1` … `faq-5` |

## Fotografias

Licenças abertas via Wikimedia Commons, creditadas no rodapé (lista em `content.ts → credits`).
A foto da eólica é do parque de Middelgrunden (Dinamarca), usada como ilustração do tema, e a do
mangue é da Bahia; troque por fotos da própria região quando houver.

## Versão anterior

O site original em arquivo único está em `legacy/index.html`.
