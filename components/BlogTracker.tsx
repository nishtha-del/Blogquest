"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  type BlogPost,
  type BlogPostType,
  type BlogSource,
  type BlogStatus,
  type ContentPillar,
  exportAllData,
  getBlogPosts,
  importAllData,
  saveBlogPosts,
} from "@/lib/storage";

const STATUSES: BlogStatus[] = [
  "Idea",
  "In Progress",
  "Review",
  "Done",
];

const PILLARS: ContentPillar[] = [
  "Product",
  "Growth",
  "Technical",
  "Case Study",
  "Thought Leadership",
];

const TYPES: BlogPostType[] = ["Pillar", "Spoke"];

const SOURCES: BlogSource[] = [
  "Keyword Research",
  "Competitor",
  "Brainstorm",
  "Customer Interview",
  "Other",
];

type EditTarget = { id: string; field: keyof BlogPost } | null;

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `bq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyPost(): BlogPost {
  return {
    id: newId(),
    title: "",
    status: "Idea",
    assignee: "",
    contentPillar: "Product",
    type: "Spoke",
    source: "Other",
    keywords: "",
    notes: "",
  };
}

const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "seed-1",
    title: "How We Cut Enterprise Churn 28% With Onboarding Playbooks",
    status: "Done",
    assignee: "Maya Ortiz",
    contentPillar: "Growth",
    type: "Pillar",
    source: "Customer Interview",
    keywords: "churn, onboarding, B2B SaaS, retention",
    notes:
      "Linked to Q1 CS webinar. Repurpose quotes for LinkedIn snippet.",
  },
  {
    id: "seed-2",
    title: "SOC 2 Type II: What Security Buyers Actually Ask in Reviews",
    status: "Review",
    assignee: "Jordan Kim",
    contentPillar: "Technical",
    type: "Spoke",
    source: "Keyword Research",
    keywords: "SOC 2, compliance, enterprise, security",
    notes: "Legal review on one quote; diagrams from SecOps.",
  },
  {
    id: "seed-3",
    title: "From Spreadsheet Hell to Single Source of Truth (Manufacturing)",
    status: "In Progress",
    assignee: "Sam Rivera",
    contentPillar: "Case Study",
    type: "Pillar",
    source: "Competitor",
    keywords: "data integration, manufacturing, ROI, ERP",
    notes: "Logo approval pending. Pull metrics from RevOps.",
  },
  {
    id: "seed-4",
    title: "API Rate Limits That Don't Angry Your Biggest Customers",
    status: "Idea",
    assignee: "Alex Chen",
    contentPillar: "Product",
    type: "Spoke",
    source: "Brainstorm",
    keywords: "API, platform, developer experience, limits",
    notes: "Pair with upcoming changelog policy.",
  },
  {
    id: "seed-5",
    title: "The CFO's Guide to SaaS Unit Economics in 2026",
    status: "Idea",
    assignee: "Priya Nair",
    contentPillar: "Thought Leadership",
    type: "Pillar",
    source: "Keyword Research",
    keywords: "unit economics, CFO, NRR, SaaS metrics",
    notes: "Syndicate to finance newsletters; needs FP&A charts.",
  },
  {
    id: "seed-6",
    title: "Why Your 'AI Features' Page Isn't Converting (And How to Fix It)",
    status: "Review",
    assignee: "Riley Park",
    contentPillar: "Growth",
    type: "Spoke",
    source: "Competitor",
    keywords: "AI, positioning, conversion, messaging",
    notes: "Soften competitor mentions per marketing.",
  },
];

const selectClass =
  "w-full min-w-[7rem] border-2 border-quest-brown/60 bg-quest-cream/90 px-1 py-1 font-body text-base text-quest-dark shadow-[inset_1px_1px_0_#fff8e7] focus:border-quest-gold focus:outline-none";

const inputClass =
  "w-full min-w-0 border-2 border-quest-brown/40 bg-quest-cream/80 px-1 py-1 font-body text-base text-quest-dark shadow-[inset_1px_1px_0_#fff8e7] focus:border-quest-gold focus:outline-none";

const btnRetro =
  "inline-flex items-center justify-center gap-2 border-2 border-quest-brown bg-quest-gold px-3 py-2 font-quest text-[8px] uppercase tracking-wide text-quest-dark shadow-[3px_3px_0_#2c1a0e] hover:bg-[#f5ca4a] active:translate-x-px active:translate-y-px active:shadow-[2px_2px_0_#2c1a0e]";

const btnDanger =
  "inline-flex items-center justify-center border-2 border-[#5c1f1f] bg-quest-red p-1.5 text-quest-cream shadow-[2px_2px_0_#2c0a0a] hover:brightness-110";

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM4 7h16l-1 14H5L4 7z" />
    </svg>
  );
}

function StatusBadge({ status }: { status: BlogStatus }) {
  const styles: Record<BlogStatus, string> = {
    Idea: "bg-[#b8b8b8] border-[#5a5a5a] text-quest-dark",
    "In Progress": "bg-quest-amber border-quest-brown text-quest-dark",
    Review: "bg-[#4a7eb5] border-[#2a4a6e] text-quest-cream",
    Done: "bg-quest-moss border-[#1a331e] text-quest-cream",
  };
  return (
    <span
      className={`block w-full whitespace-nowrap border-2 px-2 py-1 text-center font-body text-sm font-bold uppercase shadow-[2px_2px_0_#1a0f08] ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }: { type: BlogPostType }) {
  const cls =
    type === "Pillar"
      ? "bg-[#5c3d75] border-[#3d2850] text-[#f3e8ff]"
      : "bg-[#2a8a8a] border-[#1a5555] text-quest-cream";
  return (
    <span
      className={`block w-full border-2 px-2 py-1 text-center font-body text-sm font-bold shadow-[2px_2px_0_#1a0f08] ${cls}`}
    >
      {type}
    </span>
  );
}

function PillarPlate({ pillar }: { pillar: ContentPillar }) {
  return (
    <span className="block w-full border-2 border-quest-brown bg-quest-parchment/90 px-2 py-1 text-center font-body text-base font-semibold text-quest-dark shadow-[inset_1px_1px_0_#fff8e7]">
      {pillar}
    </span>
  );
}

function SourcePlate({ source }: { source: BlogSource }) {
  return (
    <span className="block w-full border-2 border-quest-brown/70 bg-quest-cream/90 px-1 py-1 text-center font-body text-sm leading-tight text-quest-dark">
      {source}
    </span>
  );
}

function updatePost(
  posts: BlogPost[],
  id: string,
  patch: Partial<BlogPost>,
): BlogPost[] {
  return posts.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

export function BlogTracker() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [edit, setEdit] = useState<EditTarget>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | BlogStatus>("all");
  const [pillarFilter, setPillarFilter] = useState<"all" | ContentPillar>(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | BlogPostType>("all");
  const [search, setSearch] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);

  useEffect(() => {
    let initial = getBlogPosts();
    if (initial.length === 0) {
      initial = SAMPLE_POSTS;
      saveBlogPosts(initial);
    }
    setPosts(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveBlogPosts(posts);
  }, [posts, hydrated]);

  const stats = useMemo(() => {
    const total = posts.length;
    const done = posts.filter((p) => p.status === "Done").length;
    const inProgress = posts.filter((p) => p.status === "In Progress").length;
    return { total, done, inProgress };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (pillarFilter !== "all" && p.contentPillar !== pillarFilter) {
        return false;
      }
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const kw = p.keywords
          .split(",")
          .map((k) => k.trim().toLowerCase())
          .some((k) => k.includes(q));
        if (!inTitle && !kw) return false;
      }
      return true;
    });
  }, [posts, statusFilter, pillarFilter, typeFilter, search]);

  const patch = useCallback((id: string, p: Partial<BlogPost>) => {
    setPosts((prev) => updatePost(prev, id, p));
  }, []);

  const remove = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setEdit((e) => (e?.id === id ? null : e));
  }, []);

  const addRow = useCallback(() => {
    setPosts((prev) => [...prev, emptyPost()]);
  }, []);

  const onExport = useCallback(() => {
    exportAllData();
    setImportMsg(null);
  }, []);

  const onImportFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = importAllData(text);
      if (result.ok) {
        setPosts(getBlogPosts());
        setImportMsg("Imported — data loaded from file.");
      } else {
        setImportMsg(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
  }, []);

  const isEditing = (id: string, field: keyof BlogPost) =>
    edit?.id === id && edit.field === field;

  if (!hydrated) {
    return (
      <div className="font-body text-xl text-quest-brown/80">
        Loading quest log…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b-2 border-quest-brown/30 pb-3">
        <h2 className="font-quest text-xs text-quest-brown sm:text-sm">
          📜 Blog Tracker
        </h2>
        <p className="mt-2 text-quest-brown/90">
          Click any cell to edit. Scroll sideways to see every column. Saves to
          localStorage automatically.
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-2"
        role="status"
        aria-label="Blog statistics"
      >
        {[
          {
            label: "Total",
            value: stats.total,
            accent: "from-quest-brown to-quest-dark",
          },
          {
            label: "Done",
            value: stats.done,
            accent: "from-quest-moss to-[#2d5a32]",
          },
          {
            label: "In progress",
            value: stats.inProgress,
            accent: "from-quest-amber to-[#a67c00]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`border-2 border-quest-brown bg-gradient-to-b ${s.accent} px-3 py-2 text-quest-cream`}
            style={{
              boxShadow:
                "inset 1px 1px 0 rgba(255,255,255,0.2), 2px 2px 0 #2c1a0e",
            }}
          >
            <p className="font-quest text-[7px] uppercase tracking-widest text-quest-cream/90">
              {s.label}
            </p>
            <p className="mt-1 font-quest text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div
        className="flex flex-col gap-3 border-2 border-quest-brown bg-quest-cream/90 p-3"
        style={{
          boxShadow:
            "inset 2px 2px 0 #fff8e7, inset -2px -2px 0 #c4a574, 0 0 0 1px #2c1a0e",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={btnRetro} onClick={onExport}>
            ⬆ Export Data
          </button>
          <label className={btnRetro + " cursor-pointer"}>
            ⬇ Import Data
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={onImportFile}
            />
          </label>
        </div>
        {importMsg ? (
          <p className="font-body text-lg text-quest-brown">{importMsg}</p>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <label className="flex flex-col gap-1">
            <span className="font-quest text-[7px] text-quest-brown">Status</span>
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | BlogStatus)
              }
            >
              <option value="all">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-quest text-[7px] text-quest-brown">
              Content pillar
            </span>
            <select
              className={selectClass}
              value={pillarFilter}
              onChange={(e) =>
                setPillarFilter(e.target.value as "all" | ContentPillar)
              }
            >
              <option value="all">All</option>
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-quest text-[7px] text-quest-brown">Type</span>
            <select
              className={selectClass}
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "all" | BlogPostType)
              }
            >
              <option value="all">All</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="font-quest text-[7px] text-quest-brown">
              Search title / keywords
            </span>
            <input
              type="search"
              className={inputClass}
              placeholder="Filter…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div
        className="w-full max-w-full overflow-x-auto border-2 border-quest-brown bg-quest-parchment/60 p-1"
        style={{
          boxShadow:
            "inset 2px 2px 0 #f5e6c8, inset -2px -2px 0 #5c3d11, 0 0 0 1px #2c1a0e",
        }}
      >
        <table className="w-full min-w-[1400px] border-collapse font-body text-lg">
          <thead>
            <tr className="border-b-2 border-quest-brown bg-quest-brown text-quest-cream">
              <th className="sticky left-0 z-10 min-w-[220px] bg-quest-brown p-2 text-left font-normal">
                Title
              </th>
              <th className="min-w-[150px] whitespace-nowrap p-2 text-left font-normal">
                Status
              </th>
              <th className="min-w-[120px] p-2 text-left font-normal">
                Assignee
              </th>
              <th className="min-w-[160px] p-2 text-left font-normal">
                Content pillar
              </th>
              <th className="min-w-[120px] p-2 text-left font-normal">Type</th>
              <th className="min-w-[180px] p-2 text-left font-normal">Source</th>
              <th className="min-w-[200px] p-2 text-left font-normal">
                Keywords
              </th>
              <th className="min-w-[220px] p-2 text-left font-normal">Notes</th>
              <th className="w-14 p-2 text-center font-normal"> </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-6 text-center text-quest-brown/80"
                >
                  No rows match filters.
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-quest-brown/40 ${
                    i % 2 === 1 ? "bg-quest-cream/35" : ""
                  }`}
                >
                  <td className="sticky left-0 z-[1] border-r-2 border-quest-brown/40 bg-quest-parchment p-1 align-top">
                    {isEditing(row.id, "title") ? (
                      <input
                        className={inputClass}
                        autoFocus
                        value={row.title}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, { title: e.target.value })
                        }
                        aria-label="Title"
                      />
                    ) : (
                      <button
                        type="button"
                        className="min-h-[2.5rem] w-full cursor-pointer rounded-sm border-2 border-transparent px-1 py-1 text-left font-body text-lg text-quest-dark hover:border-quest-gold/50"
                        onClick={() => setEdit({ id: row.id, field: "title" })}
                        title={row.title || "Click to edit"}
                      >
                        {row.title || (
                          <span className="text-quest-brown/45">
                            Click to edit title…
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="min-w-[150px] p-1 align-top">
                    {isEditing(row.id, "status") ? (
                      <select
                        className={selectClass}
                        autoFocus
                        value={row.status}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, {
                            status: e.target.value as BlogStatus,
                          })
                        }
                        aria-label="Status"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer"
                        onClick={() =>
                          setEdit({ id: row.id, field: "status" })
                        }
                      >
                        <StatusBadge status={row.status} />
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "assignee") ? (
                      <input
                        className={inputClass}
                        autoFocus
                        value={row.assignee}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, { assignee: e.target.value })
                        }
                        aria-label="Assignee"
                      />
                    ) : (
                      <button
                        type="button"
                        className="min-h-[2.25rem] w-full cursor-pointer border-2 border-transparent px-1 text-left hover:border-quest-gold/50"
                        onClick={() =>
                          setEdit({ id: row.id, field: "assignee" })
                        }
                      >
                        {row.assignee || (
                          <span className="text-quest-brown/45">—</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "contentPillar") ? (
                      <select
                        className={selectClass}
                        autoFocus
                        value={row.contentPillar}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, {
                            contentPillar: e.target.value as ContentPillar,
                          })
                        }
                      >
                        {PILLARS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer"
                        onClick={() =>
                          setEdit({ id: row.id, field: "contentPillar" })
                        }
                      >
                        <PillarPlate pillar={row.contentPillar} />
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "type") ? (
                      <select
                        className={selectClass}
                        autoFocus
                        value={row.type}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, {
                            type: e.target.value as BlogPostType,
                          })
                        }
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer"
                        onClick={() => setEdit({ id: row.id, field: "type" })}
                      >
                        <TypeBadge type={row.type} />
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "source") ? (
                      <select
                        className={selectClass + " min-w-[10rem]"}
                        autoFocus
                        value={row.source}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, {
                            source: e.target.value as BlogSource,
                          })
                        }
                      >
                        {SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className="w-full cursor-pointer"
                        onClick={() =>
                          setEdit({ id: row.id, field: "source" })
                        }
                      >
                        <SourcePlate source={row.source} />
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "keywords") ? (
                      <input
                        className={inputClass}
                        autoFocus
                        value={row.keywords}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, { keywords: e.target.value })
                        }
                        placeholder="comma, separated"
                        aria-label="Keywords"
                      />
                    ) : (
                      <button
                        type="button"
                        className="min-h-[2.25rem] w-full cursor-pointer border-2 border-transparent px-1 text-left text-base hover:border-quest-gold/50"
                        onClick={() =>
                          setEdit({ id: row.id, field: "keywords" })
                        }
                        title={row.keywords}
                      >
                        {row.keywords || (
                          <span className="text-quest-brown/45">—</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top">
                    {isEditing(row.id, "notes") ? (
                      <textarea
                        className={inputClass + " min-h-[4rem] resize-y"}
                        autoFocus
                        rows={3}
                        value={row.notes}
                        onBlur={() => setEdit(null)}
                        onChange={(e) =>
                          patch(row.id, { notes: e.target.value })
                        }
                        aria-label="Notes"
                      />
                    ) : (
                      <button
                        type="button"
                        className="min-h-[4rem] w-full cursor-pointer border-2 border-transparent px-1 py-1 text-left text-base leading-snug hover:border-quest-gold/50"
                        onClick={() => setEdit({ id: row.id, field: "notes" })}
                        title={row.notes}
                      >
                        {row.notes || (
                          <span className="text-quest-brown/45">
                            Click for notes…
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-1 align-top text-center">
                    <button
                      type="button"
                      className={btnDanger}
                      aria-label="Delete row"
                      onClick={() => remove(row.id)}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center border-t-2 border-quest-brown/30 pt-4">
        <button type="button" className={btnRetro} onClick={addRow}>
          + Add Row
        </button>
      </div>
    </div>
  );
}
