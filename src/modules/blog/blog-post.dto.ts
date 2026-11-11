export interface BlogPostDto {
  readonly slug: string;
  readonly category: string;
  readonly title: string;
  readonly summary: string;
  readonly image: string;
  readonly readTime: string;
  readonly paragraphs: readonly string[];
}
