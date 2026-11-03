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
