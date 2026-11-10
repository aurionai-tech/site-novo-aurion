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

Copie `.env.example` para `.env` e preencha. Na Vercel, cadastre as mesmas variáveis no painel do projeto.

## Formulário de diagnóstico

O formulário de `/contato` faz `POST /api/contact` com JSON. O endpoint (`src/pages/api/contact.ts`) roda como função da Vercel em produção e no próprio `astro dev` em desenvolvimento.

As regras ficam em `src/lib/contact-mail.ts`: recusa origem não autorizada (403), limita a 5 pedidos por IP a cada 15 minutos (429), ignora em silêncio envios com o honeypot `_hp` preenchido e exige nome, e-mail válido, descrição do processo e consentimento LGPD (400).

O envio fica em `src/lib/microsoft-graph-mail.ts`, pela Microsoft Graph (`sendMail`), com autenticação de aplicativo no Entra ID (`client_credentials`, permissão de aplicação `Mail.Send` com consentimento de administrador). O e-mail do visitante vai em Reply-To e a cópia fica em Itens enviados. Sem `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID` e `MICROSOFT_CLIENT_SECRET`, a API responde 503; falha da Graph vira 502.
