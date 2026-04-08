"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type BlogPost,
  type ContentPillar,
  getBlogPosts,
  getScratchpadItems,
} from "@/lib/storage";

function loadSnapshot() {
  return {
    posts: getBlogPosts(),
    scratchCount: getScratchpadItems().length,
  };
}

const PILLARS: ContentPillar[] = [
  "Product",
  "Growth",
  "Technical",
  "Case Study",
  "Thought Leadership",
];

const frameStyle = {
  boxShadow:
    "0 0 0 2px #f0c040, 0 0 0 4px #5c3d11, 3px 3px 0 #1a0f08, inset 0 1px 0 rgba(255,248,231,0.35)",
};

export function DashboardQuest() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [scratchCount, setScratchCount] = useState(0);

  const refresh = useCallback(() => {
    const s = loadSnapshot();
    setPosts(s.posts);
    setScratchCount(s.scratchCount);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "blogquest_posts" ||
        e.key === "blogquest_scratchpad" ||
        e.key === null
      ) {
        refresh();
      }
    };
    const onFocus = () => refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, [refresh]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "Done").length;
    const inProgress = posts.filter((p) => p.status === "In Progress").length;
    return { total, published, inProgress };
  }, [posts]);

  const pillarCounts = useMemo(() => {
    const m = new Map<ContentPillar, number>();
    PILLARS.forEach((p) => m.set(p, 0));
    posts.forEach((p) => {
      m.set(p.contentPillar, (m.get(p.contentPillar) ?? 0) + 1);
    });
    return PILLARS.map((p) => ({ pillar: p, count: m.get(p) ?? 0 }));
  }, [posts]);

  const assigneeCounts = useMemo(() => {
    const m = new Map<string, number>();
    posts.forEach((p) => {
      const a = p.assignee.trim();
      if (!a) return;
      m.set(a, (m.get(a) ?? 0) + 1);
    });
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [posts]);

  const recent = useMemo(() => {
    return [...posts].slice(-3).reverse();
  }, [posts]);

  const statCards = [
    {
      label: "Total blogs",
      value: stats.total,
      flavor: "Quest log size",
      bar: "from-quest-brown to-quest-dark",
    },
    {
      label: "Published / done",
      value: stats.published,
      flavor: "Bosses cleared",
      bar: "from-quest-moss to-[#1a331e]",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      flavor: "Active quests",
      bar: "from-quest-amber to-[#8a6500]",
    },
    {
      label: "Scratchpad ideas",
      value: scratchCount,
      flavor: "Side quests",
      bar: "from-[#4a7c59] to-[#2d4a35]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-quest-brown/30 pb-3">
        <h2 className="font-quest text-xs text-quest-brown sm:text-sm">
          📊 Hero status
        </h2>
        <p className="mt-2 text-quest-brown/90">
          Live stats from your browser save file — updates every few seconds or
          when you return to this tab.
        </p>
      </div>

      <div
        className="border-4 border-quest-brown bg-quest-dark/90 p-4 text-quest-parchment"
        style={frameStyle}
      >
        <p className="font-quest text-[8px] text-quest-gold">CHARACTER STATS</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`border-2 border-quest-brown bg-gradient-to-b ${s.bar} p-3 text-quest-cream`}
              style={{
                boxShadow:
                  "inset 1px 1px 0 rgba(255,255,255,0.15), 2px 2px 0 #0d0604",
              }}
            >
              <p className="font-quest text-[6px] uppercase tracking-widest text-quest-cream/85">
                {s.flavor}
              </p>
              <p className="mt-1 font-quest text-2xl">{s.value}</p>
              <p className="mt-1 font-body text-base opacity-95">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div
          className="border-2 border-quest-brown bg-quest-parchment p-4"
          style={{
            boxShadow:
              "inset 2px 2px 0 #fff8e7, 4px 4px 0 #2c1a0e, 0 0 0 1px #f0c040",
          }}
        >
          <h3 className="font-quest text-[9px] text-quest-brown">
            PILLAR MASTERY
          </h3>
          <ul className="mt-3 space-y-2 font-body text-lg">
            {pillarCounts.map(({ pillar, count }) => (
              <li
                key={pillar}
                className="flex justify-between border-b border-quest-brown/25 pb-1 text-quest-dark"
              >
                <span>{pillar}</span>
                <span className="font-bold text-quest-brown">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="border-2 border-quest-brown bg-quest-parchment p-4"
          style={{
            boxShadow:
              "inset 2px 2px 0 #fff8e7, 4px 4px 0 #2c1a0e, 0 0 0 1px #f0c040",
          }}
        >
          <h3 className="font-quest text-[9px] text-quest-brown">PARTY ROSTER</h3>
          <p className="mt-1 font-body text-base text-quest-brown/80">
            By assignee (blog tracker)
          </p>
          <ul className="mt-3 space-y-2 font-body text-lg">
            {assigneeCounts.length === 0 ? (
              <li className="text-quest-brown/70">No assignees yet.</li>
            ) : (
              assigneeCounts.map(({ name, count }) => (
                <li
                  key={name}
                  className="flex justify-between border-b border-quest-brown/25 pb-1 text-quest-dark"
                >
                  <span>{name}</span>
                  <span className="font-bold text-quest-brown">{count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div
        className="border-2 border-quest-brown bg-quest-cream/90 p-4"
        style={{
          boxShadow:
            "inset 2px 2px 0 #fff8e7, inset -2px -2px 0 #c4a574, 4px 4px 0 #2c1a0e",
        }}
      >
        <h3 className="font-quest text-[9px] text-quest-brown">
          RECENTLY ADDED
        </h3>
        <p className="mt-1 font-body text-base text-quest-brown/80">
          Last three entries in your blog log (end of list = newest)
        </p>
        <ol className="mt-3 list-decimal space-y-3 pl-5 font-body text-lg text-quest-dark">
          {recent.length === 0 ? (
            <li className="text-quest-brown/70">No blogs yet.</li>
          ) : (
            recent.map((p) => (
              <li key={p.id} className="border-b border-quest-brown/20 pb-2">
                <span className="font-semibold">{p.title || "Untitled"}</span>
                <span className="ml-2 text-base text-quest-brown">
                  — {p.status} · {p.contentPillar}
                  {p.assignee ? ` · ${p.assignee}` : ""}
                </span>
              </li>
            ))
          )}
        </ol>
      </div>
    </div>
  );
}
