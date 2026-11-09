# Site Aurion

Site institucional da Aurion, feito com [Astro](https://astro.build) e Tailwind CSS.

Planejamento e decisões: nota **Site Aurion - Planejamento** no vault `aurion-vault`.

## Rodar localmente

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # gera o site estático em dist/
```

## Onde editar

| O quê | Onde |
|---|---|
| Textos gerais, método, serviços, segmentos, equipe | `src/data/site.ts` |
| Cores e fontes | `src/styles/global.css` (bloco `@theme`) |
| Páginas | `src/pages/` |

Regras: o site não cita projetos nem clientes da Aurion, não expõe membros da equipe (nomes, cargos, fotos ou tamanho do time) e não cita parceiros ou programas.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha `SITE_URL` e `PUBLIC_FORM_ENDPOINT`.
