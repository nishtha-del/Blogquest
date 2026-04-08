"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  type ScratchpadItem,
  type ScratchpadItemType,
  getScratchpadItems,
  saveScratchpadItems,
} from "@/lib/storage";

const TYPES: ScratchpadItemType[] = [
  "keyword_dump",
  "competitor_replication",
  "tofu_idea",
  "lead_magnet",
];

const TYPE_META: Record<ScratchpadItemType, { tabLabel: string }> = {
  keyword_dump: { tabLabel: "Keyword loot" },
  competitor_replication: { tabLabel: "Enemy intel" },
  tofu_idea: { tabLabel: "New quests" },
  lead_magnet: { tabLabel: "Rare drops" },
};

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SAMPLE_ITEMS: ScratchpadItem[] = [
  {
    id: "sp-k1",
    type: "keyword_dump",
    title: "Enterprise API cluster — April crawl",
    content:
      "Bulk terms from Ahrefs: API rate limits, webhook retries, idempotency keys, OAuth scopes for B2B, error code glossaries.",
    status: "pending",
    tags: ["api rate limits", "webhooks", "OAuth B2B", "idempotency"],
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "sp-k2",
    type: "keyword_dump",
    title: "Security + compliance long-tail",
    content:
      "SOC 2 vs ISO 27001 for SaaS, vendor access reviews, SSO session policies, data residency EU, pen test readiness.",
    status: "pending",
    tags: ["SOC 2", "ISO 27001", "SSO", "data residency"],
    createdAt: "2026-04-03T14:30:00.000Z",
  },
  {
    id: "sp-c1",
    type: "competitor_replication",
    title: "Reverse-engineer their “ROI calculator” series",
    content:
      "They gate a spreadsheet behind email; we publish an open interactive version + methodology post to win comparison traffic.",
    status: "pending",
    tags: ["competitor", "lead gen", "interactive"],
    sourceUrl: "https://competitor.example.com/resources/roi-calculator",
    createdAt: "2026-04-04T09:15:00.000Z",
  },
  {
    id: "sp-c2",
    type: "competitor_replication",
    title: "Their weekly “changelog digest” newsletter",
    content:
      "Short recap format drives replies. Steal rhythm: one hero feature, one customer quote, one upcoming webinar CTA.",
    status: "done",
    tags: ["newsletter", "product marketing"],
    sourceUrl: "https://competitor.example.com/subscribe",
    createdAt: "2026-04-05T11:00:00.000Z",
  },
  {
    id: "sp-t1",
    type: "tofu_idea",
    title: "What is revenue operations (RevOps) in 2026?",
    content:
      "TOFU explainer tying CRM + CPQ + CS tooling; CTA to maturity checklist PDF. Target CFO + RevOps titles.",
    status: "pending",
    tags: ["TOFU", "RevOps", "explainer"],
    createdAt: "2026-04-06T08:45:00.000Z",
  },
  {
    id: "sp-t2",
    type: "tofu_idea",
    title: "“Single source of truth” myth-busting",
    content:
      "Honest take: you’ll have multiple systems — here’s how to sync truth for GTM teams without buzzword soup.",
    status: "pending",
    tags: ["TOFU", "thought leadership"],
    createdAt: "2026-04-06T16:20:00.000Z",
  },
  {
    id: "sp-l1",
    type: "lead_magnet",
    title: "Security questionnaire response bank (Notion + PDF)",
    content:
      "Pre-filled answers for top 40 enterprise security questions; update quarterly. Pair with SOC 2 pillar post.",
    status: "pending",
    tags: ["lead magnet", "security", "sales enablement"],
    createdAt: "2026-04-07T09:00:00.000Z",
  },
  {
    id: "sp-l2",
    type: "lead_magnet",
    title: "Content calendar template for lean B2B teams",
    content:
      "12-week Notion board: pillar/spoke mix, owner, keyword, distribution slots. Gate behind email for SDR follow-up.",
    status: "pending",
    tags: ["template", "Notion", "pipeline"],
    createdAt: "2026-04-07T13:40:00.000Z",
  },
];

const btnRetro =
  "inline-flex items-center justify-center gap-2 border-2 border-quest-brown bg-quest-gold px-3 py-2 font-quest text-[8px] uppercase tracking-wide text-quest-dark shadow-[3px_3px_0_#2c1a0e] hover:bg-[#f5ca4a] active:translate-x-px active:translate-y-px";

const btnGhost =
  "border-2 border-quest-brown/60 bg-quest-cream/80 px-2 py-1 font-body text-base text-quest-dark shadow-[2px_2px_0_#2c1a0e] hover:bg-quest-parchment";

const btnDanger =
  "border-2 border-[#5c1f1f] bg-quest-red px-2 py-1 text-quest-cream shadow-[2px_2px_0_#2c0a0a] hover:brightness-110";

const inputClass =
  "w-full border-2 border-quest-brown bg-quest-cream px-2 py-1.5 font-body text-lg text-quest-dark shadow-[inset_2px_2px_0_#e8dcc4] focus:outline-none focus:ring-2 focus:ring-quest-gold";

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM4 7h16l-1 14H5L4 7z" />
    </svg>
  );
}

function ScratchpadCard({
  item,
  onToggleStatus,
  onDelete,
}: {
  item: ScratchpadItem;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const done = item.status === "done";

  const shell = "relative flex flex-col overflow-hidden rounded-sm";

  const typeStyles: Record<ScratchpadItemType, string> = {
    keyword_dump: `${shell} border-2 border-[#f0c040] bg-[#3d2806] text-[#fff8e7]`,
    competitor_replication: `${shell} border-2 border-[#6b2a2a] border-b-4 border-dashed border-b-[#5c3d11] bg-[#2c1212] text-quest-parchment`,
    tofu_idea: `${shell} border-2 border-quest-brown border-l-[6px] border-l-quest-moss bg-quest-parchment text-quest-dark`,
    lead_magnet: `${shell} border-2 border-[#f0c040] bg-[#2a1f38] text-[#ede4ff]`,
  };

  const labelClass =
    "font-quest text-[7px] uppercase tracking-[0.2em] opacity-90";

  const headerByType: Record<ScratchpadItemType, { label: string; icon: string }> = {
    keyword_dump: { label: "KEYWORD LOOT", icon: "🔑" },
    competitor_replication: { label: "ENEMY INTEL", icon: "🕵️" },
    tofu_idea: { label: "NEW QUEST", icon: "🌱" },
    lead_magnet: { label: "RARE DROP", icon: "💎" },
  };

  const h = headerByType[item.type];
  const shimmer =
    item.type === "lead_magnet"
      ? {
          boxShadow:
            "0 0 0 2px #f0c040, 0 0 12px rgba(240, 192, 64, 0.45), inset 0 0 24px rgba(167, 139, 250, 0.12)",
        }
      : item.type === "keyword_dump"
        ? {
            boxShadow:
              "inset 0 2px 0 rgba(240, 192, 64, 0.25), 4px 4px 0 #1a0f08, 0 0 0 1px #5c3d11",
          }
        : undefined;

  return (
    <article
      className={`${typeStyles[item.type]} min-h-[200px] p-3`}
      style={shimmer}
    >
      <div className={`relative ${done ? "opacity-50" : ""}`}>
        <header className="mb-2 flex items-start justify-between gap-2 border-b border-black/20 pb-2">
          <div>
            <p className={labelClass}>{h.label}</p>
            <p className="mt-1 flex items-center gap-1 font-body text-xl font-bold leading-tight">
              <span aria-hidden>{h.icon}</span>
              <span>{item.title || "Untitled idea"}</span>
            </p>
          </div>
        </header>
        <p className="line-clamp-3 font-body text-base leading-snug opacity-95">
          {item.content || "—"}
        </p>

        {item.type === "keyword_dump" && item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <span
                key={t}
                className="border border-[#f0c040] bg-[#1a1204] px-2 py-0.5 font-body text-sm text-[#f0c040]"
                style={{
                  boxShadow: "2px 2px 0 #0d0802, inset 0 1px 0 rgba(255,200,80,0.2)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        ) : item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span
                key={t}
                className="border border-quest-brown/40 bg-black/10 px-1.5 py-0.5 font-body text-sm opacity-90"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {item.type === "competitor_replication" ? (
          item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate font-body text-sm text-quest-gold underline underline-offset-2 hover:text-quest-cream"
              onClick={(e) => e.stopPropagation()}
            >
              Source URL → {item.sourceUrl}
            </a>
          ) : (
            <p className="mt-2 font-body text-sm italic opacity-70">
              Source URL: (none yet)
            </p>
          )
        ) : null}

        <p className="mt-2 font-quest text-[6px] opacity-60">
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="relative z-30 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-black/15 pt-2">
        <button
          type="button"
          className={btnGhost}
          onClick={() => onToggleStatus(item.id)}
        >
          {item.status === "pending" ? "Mark done" : "Reopen"}
        </button>
        <button
          type="button"
          className={`${btnDanger} inline-flex items-center gap-1`}
          aria-label="Delete idea"
          onClick={() => onDelete(item.id)}
        >
          <TrashIcon /> Drop
        </button>
      </div>

      {done ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <span
            className="font-quest text-lg uppercase tracking-widest text-quest-red/35"
            style={{
              transform: "rotate(-18deg)",
              textShadow: "2px 2px 0 rgba(44,26,14,0.3)",
            }}
          >
            PUBLISHED
          </span>
          <span className="absolute text-5xl text-quest-moss/25">✓</span>
        </div>
      ) : null}
    </article>
  );
}

export function Scratchpad() {
  const [items, setItems] = useState<ScratchpadItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [filter, setFilter] = useState<"all" | ScratchpadItemType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState<ScratchpadItemType>("keyword_dump");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    let initial = getScratchpadItems();
    if (initial.length === 0) {
      initial = SAMPLE_ITEMS;
      saveScratchpadItems(initial);
    }
    setItems(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveScratchpadItems(items);
  }, [items, hydrated]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  const toggleStatus = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "pending" ? "done" : "pending" }
          : i,
      ),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const openModal = useCallback(() => {
    setFormType("keyword_dump");
    setFormTitle("");
    setFormContent("");
    setFormTags("");
    setFormUrl("");
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const submitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const tags = formTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const next: ScratchpadItem = {
        id: newId(),
        type: formType,
        title: formTitle.trim(),
        content: formContent.trim(),
        status: "pending",
        tags,
        sourceUrl:
          formType === "competitor_replication" && formUrl.trim()
            ? formUrl.trim()
            : undefined,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [...prev, next]);
      closeModal();
    },
    [formType, formTitle, formContent, formTags, formUrl, closeModal],
  );

  if (!hydrated) {
    return (
      <p className="font-body text-xl text-quest-brown/80">
        Unpacking the strategy satchel…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b-2 border-quest-brown/30 pb-3">
        <h2 className="font-quest text-xs text-quest-brown sm:text-sm">
          🗺️ Strategy Scratchpad
        </h2>
        <p className="mt-2 text-quest-brown/90">
          Raw ideas inbox — four card types, one quest log. Everything saves in
          your browser.
        </p>
      </div>

      <div
        className="flex flex-col gap-3 border-2 border-quest-brown bg-quest-cream/90 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        style={{
          boxShadow:
            "inset 2px 2px 0 #fff8e7, inset -2px -2px 0 #c4a574, 0 0 0 1px #2c1a0e",
        }}
      >
        <button type="button" className={btnRetro} onClick={openModal}>
          + Add Idea
        </button>
        <nav
          className="flex flex-wrap gap-1"
          aria-label="Filter by card type"
        >
          {(
            [
              { id: "all" as const, label: "All", icon: "📋" },
              { id: "keyword_dump" as const, label: "Keyword loot", icon: "🔑" },
              {
                id: "competitor_replication" as const,
                label: "Enemy intel",
                icon: "🕵️",
              },
              { id: "tofu_idea" as const, label: "New quests", icon: "🌱" },
              { id: "lead_magnet" as const, label: "Rare drops", icon: "💎" },
            ] as const
          ).map((tab) => {
            const selected =
              tab.id === "all" ? filter === "all" : filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`border-2 px-2 py-1.5 font-quest text-[7px] uppercase tracking-wide transition-colors ${
                  selected
                    ? "border-quest-gold bg-quest-gold text-quest-dark shadow-[inset_0_-3px_0_#b8860b,2px_2px_0_#2c1a0e]"
                    : "border-quest-brown bg-quest-dark text-quest-parchment hover:bg-quest-brown"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center font-body text-lg text-quest-brown/70">
          No ideas in this tab. Add one or switch filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <ScratchpadCard
                item={item}
                onToggleStatus={toggleStatus}
                onDelete={remove}
              />
            </li>
          ))}
        </ul>
      )}

      {modalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-quest-dark/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scratchpad-modal-title"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-4 border-quest-brown bg-quest-parchment p-4 shadow-[6px_6px_0_#2c1a0e,0_0_0_2px_#f0c040]"
            style={{
              boxShadow:
                "0 0 0 2px #f0c040, 0 0 0 4px #5c3d11, 6px 6px 0 #1a0f08",
            }}
          >
            <h3
              id="scratchpad-modal-title"
              className="font-quest text-xs text-quest-brown"
            >
              New idea
            </h3>
            <form className="mt-4 space-y-3" onSubmit={submitForm}>
              <div>
                <label className="font-quest text-[8px] text-quest-brown">
                  Card type
                </label>
                <select
                  className={`${inputClass} mt-1`}
                  value={formType}
                  onChange={(e) =>
                    setFormType(e.target.value as ScratchpadItemType)
                  }
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_META[t].tabLabel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-quest text-[8px] text-quest-brown">
                  Title
                </label>
                <input
                  className={`${inputClass} mt-1`}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-quest text-[8px] text-quest-brown">
                  Content / notes
                </label>
                <textarea
                  className={`${inputClass} mt-1 min-h-[100px] resize-y`}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-quest text-[8px] text-quest-brown">
                  Tags (comma-separated) — keyword loot uses these as pills
                </label>
                <input
                  className={`${inputClass} mt-1`}
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. SOC 2, enterprise, API"
                />
              </div>
              {formType === "competitor_replication" ? (
                <div>
                  <label className="font-quest text-[8px] text-quest-brown">
                    Source URL
                  </label>
                  <input
                    className={`${inputClass} mt-1`}
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="submit" className={btnRetro}>
                  Add to satchel
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
