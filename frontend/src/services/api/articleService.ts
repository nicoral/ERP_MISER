import type { Article, ArticleFilters } from '../../types/article';

const articleNames = [
  'Tornillo',
  'Tuerca',
  'Martillo',
  'Taladro',
  'Sierra',
  'Cemento',
  'Ladrillo',
  'Pintura',
  'Brocha',
  'Cinta',
  'Clavo',
  'Regla',
  'Destornillador',
  'Llave',
  'Pala',
  'Escalera',
  'Guante',
  'Casco',
  'Cemento Blanco',
  'Arena',
];
const categories = [
  'Herramientas',
  'Materiales',
  'Seguridad',
  'Construcción',
  'Eléctrico',
  'Pintura',
  'Ferretería',
  'Jardinería',
  'Industrial',
  'Oficina',
];

function generateMockArticles(): Article[] {
  return Array.from({ length: 50 }, (_, i) => ({
    code: `ART${(i + 1).toString().padStart(3, '0')}`,
    name: articleNames[i % articleNames.length],
    category: categories[i % categories.length],
    stock: Math.floor(Math.random() * 200),
    active: Math.random() > 0.2,
  }));
}

const mockArticles: Article[] = generateMockArticles();

export async function getArticles(
  page: number = 1,
  pageSize: number = 10,
  filters?: ArticleFilters
) {
  return new Promise<{
    data: Article[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(resolve => {
    setTimeout(() => {
      let filtered = [...mockArticles];
      if (filters) {
        if (filters.code) {
          filtered = filtered.filter(a =>
            a.code.toLowerCase().includes(filters.code!.toLowerCase())
          );
        }
        if (filters.name) {
          filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(filters.name!.toLowerCase())
          );
        }
        if (filters.category) {
          filtered = filtered.filter(a =>
            a.category.toLowerCase().includes(filters.category!.toLowerCase())
          );
        }
      }
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);
      const totalPages = Math.ceil(filtered.length / pageSize);
      resolve({
        data: paginated,
        total: filtered.length,
        page,
        pageSize,
        totalPages,
      });
    }, 600);
  });
}
