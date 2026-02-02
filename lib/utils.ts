import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the URL only if it is http(s). Use for img src to prevent javascript:/data: XSS.
 * Returns null for invalid or disallowed URLs.
 */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (url == null || typeof url !== "string" || url.trim() === "") return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol === "https:" || u.protocol === "http:") return url.trim();
  } catch {
    // invalid URL
  }
  return null;
}

/**
 * For use with ReactMarkdown: only allow http(s) links; block javascript:, data:, etc.
 */
export function safeMarkdownLink(href: string | null | undefined): string {
  if (href == null || typeof href !== "string" || href.trim() === "") return "#";
  try {
    const u = new URL(href.trim());
    if (u.protocol === "https:" || u.protocol === "http:") return href.trim();
  } catch {
    // invalid URL
  }
  return "#";
}
