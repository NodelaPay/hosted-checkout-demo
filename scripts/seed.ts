import { config } from "dotenv";
import { getDatabaseProvider } from "../src/infrastructure/database/factory";
import { blogPostsTable } from "../src/modules/blog/blog.table";
import { seedPosts } from "../src/modules/blog/posts.seed";
import { productsTable } from "../src/modules/catalog/product.table";
import { seedProducts } from "../src/modules/catalog/products.seed";
import { productReviewsTable } from "../src/modules/catalog/review.table";
import { seedReviews } from "../src/modules/catalog/reviews.seed";

config({ path: ".env.local" });

async function main(): Promise<void> {
  const provider = getDatabaseProvider();

  try {
    for (const product of seedProducts) {
      await provider.client
        .insert(productsTable)
        .values(product)
        .onConflictDoUpdate({
          target: productsTable.id,
          set: product,
        });
    }

    for (const post of seedPosts) {
      await provider.client
        .insert(blogPostsTable)
        .values(post)
        .onConflictDoUpdate({
          target: blogPostsTable.slug,
          set: post,
        });
    }

    for (const review of seedReviews) {
      await provider.client
        .insert(productReviewsTable)
        .values(review)
        .onConflictDoUpdate({
          target: productReviewsTable.id,
          set: review,
        });
    }

    console.info(
      `Seeded ${seedProducts.length} products, ${seedPosts.length} posts, and ${seedReviews.length} reviews.`,
    );
  } finally {
    await provider.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
