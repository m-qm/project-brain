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
];

const BLOG_ES: Record<string, { title: string; description: string }> = {
  "stop-fake-prices": {
    title: "Cómo evitar que tu blog publique precios que no existen",
    description:
      "Si una IA escribe el blog de tu tienda o estudio, el error caro es un precio o un pack que no está en tu web.",
  },
};

export function blogText(post: BlogPost, locale: string): BlogPost {
  if (locale !== "es") return post;
  const copy = BLOG_ES[post.slug];
  return copy ? { ...post, ...copy } : post;
}
