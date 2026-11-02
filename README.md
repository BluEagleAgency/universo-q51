# Q51 V2.1 — EIDON · Versão corrigida para comparação

Criada em 02/11/2026 a partir da V2 do Ausion, preservada em `reference/V2_Ausion_original.html`. Esta entrega é independente e não substitui arquivos no Drive ou no domínio publicado.

## Rodar no Mac

Requer Node.js 24. Nenhuma dependência npm adicional é necessária.

```bash
cd q51-eidon-v2.1
npm run dev
```

Abra `http://localhost:3000`. O servidor inclui API e banco SQLite persistente em `.data/q51.sqlite`. Os dados fictícios da validação não fazem parte do pacote. Para testar novamente, use contatos fictícios distintos: o serviço bloqueia duplicados na mesma modalidade.

```bash
npm test
npm run build
```

`dist` contém a saída estática. Abrir apenas o HTML via Finder não executa o serviço de cadastro; use o servidor acima.

## O que comparar com a V2 do Ausion

| Elemento | V2 analisada | V2.1 EIDON |
| --- | --- | --- |
| Terra | Esfera escura com wireframe | Continentes reconhecíveis, oceanos, grade tática e atmosfera |
| Bandeiras no globo | Pins luminosos; emojis em cards separados | Bandeiras SVG locais projetadas sobre o globo, rótulos e ocultação do hemisfério traseiro |
| Seleção dos dez países | Pins pequenos e grade sem ligação completa | Pins e lista conectada; seleção centraliza o país; pontos próximos são espaçados por ocultação de colisão e continuam disponíveis na lista |
| Dual Orbit | Terra e Nova Zaya | Preservado; Nova Zaya com eclipse e superfície procedural conceitual |
| Transição | Câmera para esquerda / card à direita | Ambos os planetas se deslocam à esquerda; painel à direita. Em celular, painel inferior |
| Compatibilidade | Exige WebGL | WebGL + renderizador Canvas com geografia e rotação; lista disponível mesmo sem 3D |
| Oferta | Em tela separada | Ações desde Órbitas e faixa com data, local, preço e limite |
| Fundadores | Código aleatório e armazenamento no navegador | API, persistência, credencial sequencial única e retry seguro |
| Candidatura | Mensagem sem envio | API real com status de sucesso ou erro |
| Radar | Armazenamento local do navegador | Inscrição no banco; aviso explícito sobre futura ativação do WhatsApp |
| Navegação | Troca de telas e pushState | Voltar/Avançar e links diretos sincronizados com telas |
| Conteúdo | Claims provisórios em destinos internacionais | Texto de acompanhamento sem promessa de entrega ou benefícios não confirmados |

## Organização

- `public/index.html`: telas Órbitas, Obras, Encontro, Agentes e Fundadores.
- `public/css/styles.css`: base da V2; `eidon.css`: composição corrigida e responsividade.
- `public/js/globe.js`: motor Dual Orbit, geografia, pins, projeção, arraste, painel, relógio de Nova Zaya e fallback Canvas.
- `public/js/locations.js`: dez setores e coordenadas de referência por cidade.
- `public/js/land.js`: contornos Natural Earth usados pelo fallback.
- `public/js/app.js`: navegação, formulários, SVG, agenda e manifesto.
- `public/js/config.js`: data, manifesto, link VIP e contato.
- `public/assets/earth-tactical.webp`: textura terrestre criada a partir de dados geográficos reais.
- `public/assets/flags`: dez bandeiras SVG; Inglaterra usa sua própria bandeira.
- `lib/`, `api/`, `schema.sql`: serviço de cadastro e integração de produção.
- `scripts/`: servidor local e build. `tests/`: validação do serviço.

## Configurar produção na Vercel

1. Crie um projeto Supabase dedicado e execute `schema.sql`.
2. Importe a pasta na Vercel, framework Other, Node 24.x, build `npm run build`, output `dist`.
3. Configure as variáveis indicadas em `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_ORIGIN` (origem exata sem barra final) e `RATE_LIMIT_SECRET` (segredo longo aleatório).
4. Publique e valide os cadastros no domínio final. A API em `api/register.mjs` será executada no servidor. Se os segredos faltarem, retorna erro explícito sem confirmar uma inscrição.
5. Ao mudar o domínio, atualizar `PUBLIC_ORIGIN` e realizar novo deploy.

As chaves de servidor ficam exclusivamente nas variáveis da Vercel. O SQLite serve ao desenvolvimento local; não é usado como banco efêmero em produção. Dados locais não são migrados automaticamente.

## Integrações ainda dependentes de definição

- `Q51_CONFIG.vipChannel`: inserir URL oficial do Canal Silencioso. Enquanto vazio, o botão fica oculto e a confirmação explica a pendência.
- Comissão por combo: a página informa que valor e condições serão apresentados na seleção. O campo de configuração é reservado para o próximo ajuste editorial.
- WhatsApp: o radar coleta o interesse com consentimento. Este pacote não envia mensagens e não promete disparo de 1 hora antes. Ativar a campanha T−60min exige provedor, horários dos cartões, template e rotina de envio.
- Controle de estoque: a prioridade é uma solicitação registrada. Compra e disponibilidade são confirmadas nos caixas da Leitura, dentro dos 120 combos. A plataforma não vende nem reserva estoque do caixa.
- Nova Zaya é uma proposta procedural para a experiência, sem pretensão de estabelecer sua geografia canônica. Substituir por arte aprovada quando disponível.

## Validação realizada

- Quatro testes do serviço passaram: dados/consentimento, duplicação, sequência/idempotência e limite diário.
- No navegador, emitida credencial após persistência no SQLite, enviada candidatura, abertos painéis de BH e Nova Zaya e conferida navegação.
- Layout conferido dentro de viewport de 390px via iframe de QA, sem transbordamento horizontal. O arquivo temporário de QA não está incluído.
- O navegador de validação não disponibilizou contexto WebGL. O fallback Canvas foi validado visualmente com continentes, bandeiras e painel. O caminho WebGL tem sintaxe verificada e exige validação visual em um navegador com WebGL ativo, inclusive Safari/iPhone.
- O site não foi publicado. Não há resultados de desempenho de campo, conversões ou compatibilidade universal medidos.

## Limites e cuidados operacionais

Os códigos vão de `#U51-FND-0001` a `#U51-FND-9999`. Em produção podem existir lacunas por transações interrompidas. Credencial de presença é diferente do Estatuto Vitalício das cinco Chaves Douradas. O consentimento é específico à modalidade; novidades gerais são opcionais. A operação deve atender correção/exclusão e revisar retenção após o evento. O banco é acessível à operação pelo painel privado; não há listagem pública de inscritos.

## Créditos

- Geografia: Natural Earth, domínio público. Ver `NATURAL-EARTH-NOTICE.txt`.
- Bandeiras: lipis/flag-icons, MIT. Ver `FLAG-ICONS-LICENSE.txt`.
- Three.js: biblioteca fornecida com a V2 de origem, MIT.
- Capas e identidade: Universo Q51 / Noah Arco, recuperadas do material oficial.
- Direção e correções desta versão: EIDON, para comparação pelo Criador e Ausion.
