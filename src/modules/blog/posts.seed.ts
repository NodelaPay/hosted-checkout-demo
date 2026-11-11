import type { BlogPostDto } from "./blog-post.dto";

export const seedPosts: readonly BlogPostDto[] = [
  {
    slug: "find-your-next-phone",
    category: "Buying guide",
    title: "Finding a phone that fits your day",
    summary:
      "A few practical things to consider before choosing your next everyday companion.",
    image: "/images/iphone-14-pro-max.png",
    readTime: "4 min read",
    paragraphs: [
      "Start with how you use your phone most. If you take plenty of photos, look closely at the camera system and storage. If your day is spent on calls, maps, and messages, battery life and screen comfort may matter more.",
      "A good shortlist should include the size you enjoy holding, the capacity you need for photos and apps, and a price that feels right. Compare those basics first, then explore the details that make each device feel personal.",
      "The best choice is the one that works naturally in your routine. Browse the catalog, save your favorites, and take your time comparing.",
    ],
  },
  {
    slug: "desk-setup-essentials",
    category: "Inspiration",
    title: "Small upgrades for a better desk setup",
    summary:
      "Thoughtful technology can make your workspace feel a little more like yours.",
    image: "/images/78.webp",
    readTime: "3 min read",
    paragraphs: [
      "A better workspace starts with the essentials: a comfortable screen position, enough light, and room to focus. Technology should support that space rather than crowd it.",
      "Think about which devices you reach for every day. A dependable computer, a good pair of headphones, and a tidy charging spot can make a noticeable difference.",
      "Build the setup slowly. Keeping only what earns its place on the desk makes the result easier to use and easier to enjoy.",
    ],
  },
  {
    slug: "take-your-sound-anywhere",
    category: "Audio",
    title: "Take your sound anywhere",
    summary:
      "From quiet commutes to focused afternoons, find the listening style that suits you.",
    image: "/images/101.webp",
    readTime: "3 min read",
    paragraphs: [
      "The right headphones depend on where you listen. Over-ear models can create a more immersive experience at a desk or on a long journey. Smaller earbuds are easy to carry and quick to use throughout the day.",
      "Comfort, fit, and how you switch between devices are worth considering alongside sound. A pair you enjoy wearing is the pair you will keep using.",
      "Explore a few options in the catalog and imagine the moments when they would fit into your routine.",
    ],
  },
];
