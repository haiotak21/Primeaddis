export function toSlug(text?: string) {
  if (!text || typeof text !== "string") return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
