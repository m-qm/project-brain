export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
};

/** Live posts only. Drafts stay in the HITL queue until a human adds a slug here. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "stop-fake-prices",
    title: "How to stop your blog publishing prices that do not exist",
    description:
      "If an AI writes your shop or studio blog, the expensive error is a price or pack that is not on your site.",
    date: "2026-11-03",
  },
  {
    slug: "ranking-you-cannot-show",
    title: "How to stop your blog claiming a ranking you cannot show",
    description:
      "If an AI writes your shop or studio blog, the expensive line is a ranking, a visit count, or a client name you cannot show.",
    date: "2026-11-08",
  },
];

const BLOG_ES: Record<string, { title: string; description: string }> = {
  "stop-fake-prices": {
    title: "Cómo evitar que tu blog publique precios que no existen",
    description:
      "Si una IA escribe el blog de tu tienda o estudio, el error caro es un precio o un pack que no está en tu web.",
  },
  "ranking-you-cannot-show": {
    title: "Cómo evitar que tu blog afirme un ranking que no puedes mostrar",
    description:
      "Si una IA escribe el blog de tu tienda o estudio, la línea cara es un ranking, unas visitas o un cliente que no puedes mostrar.",
  },
};

export function blogText(post: BlogPost, locale: string): BlogPost {
  if (locale !== "es") return post;
  const copy = BLOG_ES[post.slug];
  return copy ? { ...post, ...copy } : post;
}
