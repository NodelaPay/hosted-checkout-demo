import type { BlogPostDto } from "./blog-post.dto";

export interface BlogRepository {
  list(): Promise<readonly BlogPostDto[]>;
  getBySlug(slug: string): Promise<BlogPostDto | undefined>;
}
