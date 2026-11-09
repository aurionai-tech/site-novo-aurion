import { getCollection } from 'astro:content';

export async function getPublishedCases() {
  const cases = await getCollection('cases', ({ data }) => (import.meta.env.PROD ? data.autorizado : true));
  return cases.sort((a, b) => a.data.ordem - b.data.ordem);
}
