import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z.object({
    titulo: z.string(),
    cliente: z.string(),
    segmento: z.string(),
    resumo: z.string(),
    problema: z.string(),
    processo: z.string(),
    solucao: z.string(),
    resultado: z.string(),
    // Só vai ao ar (build de produção) com autorização do cliente.
    autorizado: z.boolean().default(false),
    destaque: z.boolean().default(false),
    ordem: z.number().default(100),
  }),
});

export const collections = { cases };
