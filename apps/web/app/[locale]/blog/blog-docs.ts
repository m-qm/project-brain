export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
};

/** Live posts only. Drafts stay in the HITL queue until a human adds a slug here.
 * `date` is the sitemap lastmod for both languages. Change it when the page changes.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "same-notes-review-email-quote",
    title: "How to answer a review, an email, and a quote from the same notes",
    description:
      "The review, the email, and the quote can come from the same notes. A price that was never written is not sent.",
    date: "2026-11-10",
  },
  {
    slug: "stop-fake-prices",
    title: "How to stop my blog posting a price I do not charge",
    description:
      "If an AI writes your blog, it can add a price your site does not charge. That number is cut or left to confirm.",
    date: "2026-11-03",
  },
  {
    slug: "ranking-you-cannot-show",
    title: "How to remove a ranking or a client my blog cannot show",
    description:
      "An AI can write that you rank first on Google, or name a client. If you cannot open the proof, that line comes out.",
    date: "2026-11-08",
  },
  {
    slug: "title-a-shop-owner-would-search",
    title: "How to title a blog post for your shop",
    description:
      "The title should be the line you would type into Google: an empty blog, a price on request, an offer that is not yours.",
    date: "2026-11-08",
  },
];

const BLOG_ES: Record<string, { title: string; description: string }> = {
  "same-notes-review-email-quote": {
    title: "Cómo contestar una reseña, un correo y un presupuesto con la misma información",
    description:
      "La reseña, el correo y el presupuesto pueden salir de las mismas notas. Un precio que no está escrito no se envía.",
  },
  "stop-fake-prices": {
    title: "Cómo evitar que mi blog ponga un precio que no cobro",
    description:
      "Si una IA escribe tu blog, puede colar un precio que tu web no cobra. Ese número se corta o queda por confirmar.",
  },
  "ranking-you-cannot-show": {
    title: "Cómo quitar de mi blog un ranking o un cliente que no puedo enseñar",
    description:
      "Una IA puede escribir que sales primero en Google o nombrar un cliente. Si no puedes abrir la prueba, esa frase se quita.",
  },
  "title-a-shop-owner-would-search": {
    title: "Cómo titular el artículo del blog de tu tienda",
    description:
      "El título tiene que ser la frase que escribirías en Google: el blog vacío, el precio a consultar, la oferta que no es tuya.",
  },
};

export function blogText(post: BlogPost, locale: string): BlogPost {
  if (locale !== "es") return post;
  const copy = BLOG_ES[post.slug];
  return copy ? { ...post, ...copy } : post;
}
