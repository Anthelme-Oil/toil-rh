import { NewsColor } from "@/types";
const NEWS_COLORS: NewsColor[] = [
  "peach",
  "lavender",
  "mint",
];

export function getNewsColor(id: number): NewsColor {
  return NEWS_COLORS[id % NEWS_COLORS.length];
}