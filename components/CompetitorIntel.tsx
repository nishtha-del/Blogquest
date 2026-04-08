"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CompetitorBlogRow,
  type CompetitorResponseStatus,
  getCompetitorBlogs,
  saveCompetitorBlogs,
} from "@/lib/storage";

const RESPONSES: CompetitorResponseStatus[] = ["None", "Planned", "Done"];

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SAMPLES: CompetitorBlogRow[] = [
  {
    id: "cp-1",
    competitorName: "AcmeStack",
    blogTitle: "The Complete Guide to API-First Selling in 2026",
    theirKeyword: "API-first sales",
    contentType: "Pillar guide",
    ourResponseStatus: "Planned",
    notes:
      "We own deeper implementation content — counter with customer build stories + Postman-style walkthrough.",
  },
  {
    id: "cp-2",
    competitorName: "Northwind SaaS",
    blogTitle: "Why Your RevOps Dashboard Is Lying to You",
    theirKeyword: "RevOps metrics",
    contentType: "Thought leadership",
    ourResponseStatus: "None",
    notes:
      "Provocative hook; thin on methodology. Opportunity: honest framework post with templates.",
  },
  {
    id: "cp-3",
    competitorName: "Vertex Cloud",
    blogTitle: "SOC 2 in 30 Days: Marketing or Reality?",
    theirKeyword: "SOC 2 timeline",
    contentType: "Hot take / SEO",
    ourResponseStatus: "Done",
    notes:
      "We published “Security reviews that close” series — monitor their backlinks for 90 days.",
  },
  {
    id: "cp-4",
    competitorName: "PulseMetrics",
    blogTitle: "Free ROI Calculator: Content Attribution for B2B",
    theirKeyword: "content ROI calculator",
    contentType: "Lead magnet",
    ourResponseStatus: "Planned",
    notes:
      "Gated tool; plan open-source Notion version + blog methodology to outrank.",
  },
];

const inputClass =
  "w-full min-w-[8rem] border-2 border-quest-brown/50 bg-quest-cream/90 px-2 py-1 font-body text-base text-quest-dark shadow-[inset_1px_1px_0_#fff8e7] focus:border-quest-gold focus:outline-none";

const selectClass =
  "w-full border-2 border-quest-brown/50 bg-quest-cream/90 px-2 py-1 font-body text-base text-quest-dark focus:border-quest-gold focus:outline-none";

const btnRetro =
  "inline-flex items-center justify-center gap-2 border-2 border-quest-brown bg-quest-gold px-3 py-2 font-quest text-[8px] uppercase tracking-wide text-quest-dark shadow-[3px_3px_0_#2c1a0e] hover:bg-[#f5ca4a] active:translate-x-px active:translate-y-px";

const btnDanger =
  "border-2 border-[#5c1f1f] bg-quest-red px-2 py-1 text-quest-cream shadow-[2px_2px_0_#2c0a0a]";

function responseBadge(s: CompetitorResponseStatus) {
  const map: Record<CompetitorResponseStatus, string> = {
    None: "border-[#6b6b6b] bg-[#a8a8a8] text-quest-dark",
    Planned: "border-quest-brown bg-quest-amber text-quest-dark",
    Done: "border-[#1a331e] bg-quest-moss text-quest-cream",
  };
  return `inline-block border-2 px-2 py-0.5 font-body text-sm font-bold shadow-[2px_2px_0_#2c1a0e] ${map[s]}`;
}

export function CompetitorIntel() {
  const [rows, setRows] = useState<CompetitorBlogRow[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initial = getCompetitorBlogs();
    if (initial.length === 0) {
      initial = SAMPLES;
      saveCompetitorBlogs(initial);
    }
    setRows(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCompetitorBlogs(rows);
  }, [rows, hydrated]);

  const patch = useCallback((id: string, p: Partial<CompetitorBlogRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...p } : r)),
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: newId(),
        competitorName: "",
        blogTitle: "",
        theirKeyword: "",
        contentType: "",
        ourResponseStatus: "None",
        notes: "",
      },
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  if (!hydrated) {
    return (
      <p className="font-body text-xl text-quest-brown/80">
        Decrypting intel scroll…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b-2 border-quest-brown/30 pb-3">
        <h2 className="font-quest text-xs text-quest-brown sm:text-sm">
          🔍 Competitor Intel
        </h2>
        <p className="mt-2 text-quest-brown/90">
          Track rival posts like bounty posters — plan your counter-move and
          mark when you have struck back.
        </p>
      </div>

      <div
        className="w-full max-w-full overflow-x-auto border-2 border-quest-brown bg-quest-parchment/70 p-1"
        style={{
          boxShadow:
            "inset 2px 2px 0 #f5e6c8, inset -2px -2px 0 #5c3d11, 0 0 0 1px #2c1a0e",
        }}
      >
        <table className="w-full min-w-[1000px] border-collapse font-body text-lg">
          <thead>
            <tr className="border-b-2 border-quest-brown bg-[#3d1818] text-quest-parchment">
              <th className="p-2 text-left font-normal">Competitor name</th>
              <th className="min-w-[180px] p-2 text-left font-normal">
                Blog title
              </th>
              <th className="p-2 text-left font-normal">Their keyword</th>
              <th className="p-2 text-left font-normal">Content type</th>
              <th className="p-2 text-left font-normal">Our response</th>
              <th className="min-w-[160px] p-2 text-left font-normal">Notes</th>
              <th className="w-14 p-2" />
            </tr>
          </thead>
          <tbody className="text-quest-dark">
            {rows.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-quest-brown/40 ${
                  i % 2 === 1 ? "bg-quest-cream/50" : "bg-quest-parchment/40"
                }`}
              >
                <td className="p-1 align-top">
                  <input
                    className={inputClass}
                    value={r.competitorName}
                    onChange={(e) =>
                      patch(r.id, { competitorName: e.target.value })
                    }
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={inputClass}
                    value={r.blogTitle}
                    onChange={(e) =>
                      patch(r.id, { blogTitle: e.target.value })
                    }
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={inputClass}
                    value={r.theirKeyword}
                    onChange={(e) =>
                      patch(r.id, { theirKeyword: e.target.value })
                    }
                  />
                </td>
                <td className="p-1 align-top">
                  <input
                    className={inputClass}
                    value={r.contentType}
                    onChange={(e) =>
                      patch(r.id, { contentType: e.target.value })
                    }
                  />
                </td>
                <td className="p-1 align-top">
                  <div className="mb-1">
                    <span className={responseBadge(r.ourResponseStatus)}>
                      {r.ourResponseStatus}
                    </span>
                  </div>
                  <select
                    className={selectClass}
                    value={r.ourResponseStatus}
                    onChange={(e) =>
                      patch(r.id, {
                        ourResponseStatus: e.target
                          .value as CompetitorResponseStatus,
                      })
                    }
                  >
                    {RESPONSES.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1 align-top">
                  <textarea
                    className={`${inputClass} min-h-[3rem] resize-y`}
                    rows={2}
                    value={r.notes}
                    onChange={(e) => patch(r.id, { notes: e.target.value })}
                  />
                </td>
                <td className="p-1 align-top text-center">
                  <button
                    type="button"
                    className={btnDanger}
                    aria-label="Remove row"
                    onClick={() => remove(r.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" className={btnRetro} onClick={addRow}>
        + Add Competitor Blog
      </button>
    </div>
  );
}
