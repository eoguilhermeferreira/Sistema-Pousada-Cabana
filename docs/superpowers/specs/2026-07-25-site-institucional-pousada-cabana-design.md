# Site Institucional Pousada Cabana — Etapa 1 e 2

Data: 2026-07-25
Status: aguardando revisão do usuário

## Contexto

Site oficial da Pousada Cabana, nível premium (comparável a hotéis/resorts de alto padrão),
que servirá também como peça de portfólio da agência NODEX. Esta spec cobre apenas as
Etapas 1 e 2: site institucional + página de quartos. O sistema administrativo (reservas,
calendário, check-in/out, comanda, caixa, funcionários, chatbot, integração Booking) é
fora de escopo aqui — a arquitetura só precisa deixar espaço para ele entrar depois.

## Stack e arquitetura

- **Next.js 14+ (App Router) + TypeScript**, deploy no Vercel.
- **Tailwind CSS** com tokens de cor/tipografia como variáveis (nunca hex solto em componente).
- **shadcn/ui** como fundação de componentes base (Button, Input, Dialog/Modal etc).
- **Framer Motion** para as animações (fade / slide / zoom leve, 200–300ms).
- **lucide-react** para todos os ícones (nunca emoji).
- **next/font** para Playfair Display (títulos) e Inter (texto).
- Mobile-first: todo componente é desenhado para mobile primeiro, depois adaptado para
  tablet/notebook/desktop via breakpoints do Tailwind.

## Identidade visual

Paleta (variáveis Tailwind, não hardcode):

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#0E4DA4` | Azul principal — botões, links, destaques |
| `--color-primary-dark` | `#0A3675` | Azul escuro — CTA final, navbar ao rolar (texto) |
| `--color-primary-light` | `#EAF3FF` | Azul claro — fundos suaves, seções alternadas |
| `--color-white` | `#FFFFFF` | Fundo padrão |
| `--color-gray-light` | `#F8FAFC` | Fundo alternativo (seções claras) |
| `--color-gray-text` | `#475569` | Texto secundário |

Vermelho: só existe na logo, nunca como cor de UI. Verde: só em pequenos detalhes pontuais
(ex.: um ícone de "disponível"), nunca como cor estrutural.

Tipografia: Playfair Display para H1–H3 (hierarquia editorial/premium), Inter para corpo de
texto, labels, botões.

Ícones: lucide-react em todo o site, mesmo peso visual (stroke consistente). Fallback:
Heroicons ou Tabler Icons apenas se faltar algum ícone específico no lucide.

## Rotas

- `/` — Home (single-page com seções-âncora): Navbar, Hero, Barra de Reserva, Sobre,
  Quartos em Destaque, Galeria, Depoimentos, CTA Final, Footer.
- `/quartos` — Listagem de quartos com filtros (categoria, preço, hóspedes,
  ar-condicionado, frigobar, banheira, sacada).
- `/quartos/[slug]` — Página individual do quarto (galeria própria, descrição,
  capacidade, camas, características, preço, botão Reservar).

A Navbar linka para `/quartos` como rota real; "Início", "Galeria", "Sobre" e "Contato"
são scroll suave até a âncora correspondente na Home (se o usuário estiver em `/quartos`,
o clique primeiro navega para `/` e depois rola até a âncora).

## Navbar

Transparente sobre o Hero; ao rolar, fundo branco com efeito de vidro discreto
(`backdrop-blur`), texto e ícones em azul principal, botão "Reservar Agora" mantém
fundo azul sólido em ambos os estados.

## Hero

Ocupa quase a tela inteira. Vídeo de fundo em loop (placeholder de hotel/pousada
genérico por enquanto — trocado depois pelo vídeo real da pousada) com overlay escuro
para legibilidade. Conteúdo centralizado: logo (PNG transparente), título ("Seu refúgio
de tranquilidade em Avaré." ou similar), subtítulo, botões "Reservar Agora" e "Conhecer
Quartos". Animação de entrada em sequência: vídeo → logo → título → texto → botões,
cada um com fade+slide leve.

## Barra de Reserva

Card sobreposto logo abaixo do Hero, estilo hotel premium: campos Check-in, Check-out,
Quantidade de hóspedes, botão "Pesquisar". Bordas arredondadas, sombra leve.
**Importante (escopo):** nesta etapa não há checagem real de disponibilidade — o botão
"Pesquisar" navega para `/quartos` já com os filtros de data/hóspedes aplicados via
query params. A troca por disponibilidade real (Supabase) é um ponto de extensão futuro,
sem mudar a UI.

## Sobre a Pousada

Fundo branco. Foto institucional (placeholder até material real chegar) + texto
institucional + cards de diferenciais (Atendimento Familiar, Ambiente Tranquilo,
Excelente Localização, Conforto, Wi-Fi, Estacionamento).

## Quartos em Destaque (Home)

Cards premium: foto grande (placeholder), categoria, nome, preço inicial, ícones de
recursos, botão "Ver detalhes" → `/quartos/[slug]`. Mobile: card vertical ocupando quase
toda a largura, nunca miniaturizado.

## Página de Quartos (`/quartos`)

Filtros: categoria, faixa de preço, quantidade de hóspedes, ar-condicionado, frigobar,
banheira, sacada. Grid de cards de quarto (mesmo componente `CardQuarto` da Home).
Estado vazio tratado ("nenhum quarto encontrado com esses filtros").

### Página individual do quarto (`/quartos/[slug]`)

Galeria própria (placeholder), descrição, capacidade, quantidade de camas,
características (ícones), preço, botão "Reservar" (nesta etapa, leva para
WhatsApp/CTA de contato — sem checkout real).

## Recursos dos quartos (ícones)

Cama de casal, capacidade máxima de hóspedes, ar-condicionado, frigobar, Wi-Fi, TV,
banheiro privativo, café da manhã, estacionamento — todos via ícone lucide-react
correspondente, nunca emoji.

## Galeria

Layout em mosaico (grid assimétrico), lightbox ao clicar na imagem, transições suaves.
Populada com imagens placeholder até o material real da pousada chegar.

## Depoimentos

Seção com fundo azul (`--color-primary` ou `--color-primary-dark`), cards brancos.
Estruturada para receber avaliações reais depois (por ora, populada com um conjunto
de depoimentos placeholder claramente substituíveis).

## CTA Final

Fundo azul escuro (`--color-primary-dark`), título de impacto, botões "Reservar Agora"
e "WhatsApp".

## Footer

Logo, mapa (embed, endereço placeholder até receber o real), endereço, telefone,
WhatsApp, Instagram, Facebook, horário de atendimento, links rápidos, e a linha
"Desenvolvido por NODEX | Agência de Marketing Digital".

## Botão flutuante do WhatsApp

Circular, pequeno, discreto, sempre visível (fixed), com o mesmo número placeholder
do footer até receber o real.

## Dados de contato/conteúdo (placeholder)

Endereço, telefone, WhatsApp, Instagram e Facebook ainda não foram fornecidos pelo
cliente — ficam como placeholders claramente identificados em `data/contact.ts`,
fáceis de trocar por uma edição pontual quando os dados reais chegarem. O mesmo vale
para fotos e vídeo do Hero (placeholders licenciados/genéricos de hotel/pousada).

## Estrutura de pastas

```
src/
  app/
    page.tsx                  → Home
    quartos/page.tsx          → Listagem
    quartos/[slug]/page.tsx   → Detalhe do quarto
    layout.tsx                → Navbar + Footer globais
  components/
    ui/              → Button, Input, Card base (shadcn/ui)
    layout/          → Navbar, Footer, BotaoFlutuanteWhatsapp
    sections/        → Hero, BarraReserva, Sobre, QuartosDestaque, Galeria,
                        Depoimentos, CtaFinal
    quartos/         → CardQuarto, FiltrosQuartos, GaleriaQuarto, Lightbox
  data/
    rooms.ts         → dados mockados dos quartos (tipado, isolado)
    contact.ts       → endereço/telefone/redes sociais (placeholder)
  lib/
    utils.ts
```

## Fluxo de dados

Todos os componentes recebem dados via props tipadas (TypeScript). Hoje a fonte é
`data/rooms.ts` (array estático); quando o sistema de reservas/admin existir, essa
fonte muda para uma consulta ao Supabase — os componentes visuais não precisam ser
alterados, só a camada que busca os dados.

## Performance, SEO e acessibilidade

- Lazy loading de imagens/vídeo abaixo da dobra.
- `next/image` para otimização automática de imagens.
- Meta tags, `alt` em todas as imagens, hierarquia de headings correta (H1 único por página).
- Contraste de cor validado (WCAG AA) mesmo com a paleta azul.
- Navegação por teclado funcional em todos os componentes interativos (filtros, lightbox, navbar mobile).

## Fora de escopo (preparar terreno, não implementar)

Sistema de reservas real, calendário de ocupação, cadastro de hóspedes, check-in/check-out,
integração com Booking, painel administrativo, controle de estoque, comandas dos quartos,
controle de caixa, relatórios, gestão de funcionários, chatbot. A arquitetura de dados
(props tipadas + fonte de dados isolada) já deixa esse caminho aberto sem exigir retrabalho
estrutural quando essas partes forem construídas.
