import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  tags?: string[];
  cover?: string;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  contentHtml: string;
  readingMinutes: number;
};

export type BlogPostMeta = BlogFrontmatter & {
  slug: string;
  readingMinutes: number;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function estimateReadingMinutes(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => f.replace(/\.(md|mdx)$/, ""));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const candidates = [
    path.join(BLOG_DIR, `${slug}.md`),
    path.join(BLOG_DIR, `${slug}.mdx`),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    author: data.author || "SmartSeyali Team",
    tags: data.tags,
    cover: data.cover,
    contentHtml: processed.toString(),
    readingMinutes: estimateReadingMinutes(content),
  };
}

export async function getAllPostsMeta(): Promise<BlogPostMeta[]> {
  const slugs = getAllSlugs();
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const filePath = [
        path.join(BLOG_DIR, `${slug}.md`),
        path.join(BLOG_DIR, `${slug}.mdx`),
      ].find((p) => fs.existsSync(p))!;
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author || "SmartSeyali Team",
        tags: data.tags,
        cover: data.cover,
        readingMinutes: estimateReadingMinutes(content),
      } as BlogPostMeta;
    })
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
