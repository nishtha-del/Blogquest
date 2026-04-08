export type BlogStatus = "Idea" | "In Progress" | "Review" | "Done";

export type ContentPillar =
  | "Product"
  | "Growth"
  | "Technical"
  | "Case Study"
  | "Thought Leadership";

export type BlogPostType = "Pillar" | "Spoke";

export type BlogSource =
  | "Keyword Research"
  | "Competitor"
  | "Brainstorm"
  | "Customer Interview"
  | "Other";

export interface BlogPost {
  id: string;
  title: string;
  status: BlogStatus;
  assignee: string;
  contentPillar: ContentPillar;
  type: BlogPostType;
  source: BlogSource;
  /** Comma-separated keywords */
  keywords: string;
  notes: string;
}

export type ScratchpadItemType =
  | "keyword_dump"
  | "competitor_replication"
  | "tofu_idea"
  | "lead_magnet";

export interface ScratchpadItem {
  id: string;
  type: ScratchpadItemType;
  content: string;
  title: string;
  status: "pending" | "done";
  tags: string[];
  sourceUrl?: string | null;
  /** ISO timestamp; added on read if missing (legacy imports). */
  createdAt: string;
}

export type CompetitorResponseStatus = "None" | "Planned" | "Done";

export interface CompetitorBlogRow {
  id: string;
  competitorName: string;
  blogTitle: string;
  theirKeyword: string;
  contentType: string;
  ourResponseStatus: CompetitorResponseStatus;
  notes: string;
}

const KEY_POSTS = "blogquest_posts";
const KEY_SCRATCH = "blogquest_scratchpad";
const KEY_COMPETITORS = "blogquest_competitors";

export function getBlogPosts(): BlogPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_POSTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as BlogPost[];
  } catch {
    return [];
  }
}

export function saveBlogPosts(posts: BlogPost[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_POSTS, JSON.stringify(posts));
}

type ScratchpadRow = Omit<ScratchpadItem, "createdAt"> & { createdAt?: string };

function normalizeScratchpadItem(row: ScratchpadRow): ScratchpadItem {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.createdAt ?? new Date().toISOString(),
  };
}

export function getScratchpadItems(): ScratchpadItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_SCRATCH);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as ScratchpadRow[]).map(normalizeScratchpadItem);
  } catch {
    return [];
  }
}

export function saveScratchpadItems(items: ScratchpadItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_SCRATCH, JSON.stringify(items));
}

export function getCompetitorBlogs(): CompetitorBlogRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_COMPETITORS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as CompetitorBlogRow[];
  } catch {
    return [];
  }
}

export function saveCompetitorBlogs(rows: CompetitorBlogRow[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_COMPETITORS, JSON.stringify(rows));
}

export function exportAllData(): void {
  if (typeof window === "undefined") return;
  const payload = {
    blogquest_posts: getBlogPosts(),
    blogquest_scratchpad: getScratchpadItems(),
    blogquest_competitors: getCompetitorBlogs(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "blogquest_data.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(
  jsonString: string,
): { ok: true } | { ok: false; error: string } {
  try {
    const data = JSON.parse(jsonString) as {
      blogquest_posts?: unknown;
      blogquest_scratchpad?: unknown;
      blogquest_competitors?: unknown;
    };
    const posts = Array.isArray(data.blogquest_posts)
      ? (data.blogquest_posts as BlogPost[])
      : [];
    const scratch = Array.isArray(data.blogquest_scratchpad)
      ? (data.blogquest_scratchpad as ScratchpadItem[])
      : [];
    saveBlogPosts(posts);
    saveScratchpadItems(scratch);
    if (
      "blogquest_competitors" in data &&
      Array.isArray(data.blogquest_competitors)
    ) {
      saveCompetitorBlogs(data.blogquest_competitors as CompetitorBlogRow[]);
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid JSON";
    return { ok: false, error: msg };
  }
}
