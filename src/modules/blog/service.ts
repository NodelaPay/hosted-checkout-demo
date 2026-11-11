import { z } from "zod";
import type { CacheProvider } from "@/infrastructure/cache/contract";
import { CacheProviderFactory } from "@/infrastructure/cache/factory";
import type { BlogPostDto } from "./blog-post.dto";
import type { BlogRepository } from "./repository.contract";
import { BlogRepositoryFactory } from "./repository.factory";

const postSchema = z.object({
  slug: z.string(),
  category: z.string(),
  title: z.string(),
  summary: z.string(),
  image: z.string(),
  readTime: z.string(),
  paragraphs: z.array(z.string()),
});

export interface BlogServiceContract {
  list(): Promise<readonly BlogPostDto[]>;
  getBySlug(slug: string): Promise<BlogPostDto | undefined>;
}

export class BlogService implements BlogServiceContract {
  constructor(
    private readonly repository: BlogRepository,
    private readonly cache: CacheProvider,
  ) {}

  async list(): Promise<readonly BlogPostDto[]> {
    const cacheKey = "blog:posts:v1";
    try {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        const parsed = z.array(postSchema).safeParse(JSON.parse(cached));
        if (parsed.success) return parsed.data;
      }
    } catch (error) {
      console.error("Blog cache read failed", error);
    }

    const posts = await this.repository.list();
    try {
      await this.cache.set(cacheKey, JSON.stringify(posts), 60);
    } catch (error) {
      console.error("Blog cache write failed", error);
    }
    return posts;
  }

  async getBySlug(slug: string): Promise<BlogPostDto | undefined> {
    const posts = await this.list();
    return posts.find((post) => post.slug === slug);
  }
}

export const blogService: BlogServiceContract = new BlogService(
  BlogRepositoryFactory.create(),
  CacheProviderFactory.create(),
);
