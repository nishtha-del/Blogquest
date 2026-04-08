"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Blog Tracker", emoji: "📜", hint: "main spreadsheet" },
  { href: "/strategy", label: "Strategy Board", emoji: "🗺️", hint: "planning" },
  {
    href: "/competitors",
    label: "Competitor Intel",
    emoji: "🔍",
    hint: "spy notes",
  },
  { href: "/dashboard", label: "Dashboard", emoji: "📊", hint: "stats overview" },
] as const;

function pixelPanelClassName(active: boolean) {
  const base =
    "block w-full px-3 py-3 font-body text-lg leading-tight transition-colors duration-75";
  if (active) {
    return `${base} bg-quest-gold text-quest-dark shadow-pixel-nav-active border-2 border-quest-brown ring-2 ring-quest-gold ring-offset-2 ring-offset-quest-dark`;
  }
  return `${base} border-2 border-transparent text-quest-parchment hover:bg-quest-brown/80 hover:text-quest-gold`;
}

export function QuestSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-r-4 border-quest-brown bg-quest-dark md:w-64"
      style={{
        boxShadow:
          "inset -4px 0 0 #1a0f08, inset 4px 0 0 rgba(212, 160, 23, 0.12)",
      }}
    >
      <div className="p-3 md:p-4">
        <div
          className="mb-4 bg-quest-brown p-3 shadow-pixel-inset"
          style={{
            boxShadow:
              "inset 2px 2px 0 #8b6914, inset -2px -2px 0 #2c1a0e, 0 0 0 2px #f0c040, 0 0 0 4px #5c3d11",
          }}
        >
          <p className="font-quest text-[8px] leading-relaxed text-quest-gold sm:text-[10px]">
            MENU
          </p>
          <p className="mt-1 font-body text-base text-quest-cream">
            Choose your quest…
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Main">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname === ""
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={pixelPanelClassName(active)}
                aria-current={active ? "page" : undefined}
              >
                <span className="flex items-start gap-2">
                  <span className="shrink-0" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="flex flex-col text-left">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-base opacity-80">{item.hint}</span>
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
