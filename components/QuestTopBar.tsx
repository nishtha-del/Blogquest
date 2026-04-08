export function QuestTopBar() {
  return (
    <header
      className="relative z-10 border-b-4 border-quest-brown bg-gradient-to-b from-quest-brown via-quest-dark to-quest-dark px-6 py-4 shadow-pixel-outer"
      style={{
        boxShadow:
          "0 4px 0 #1a0f08, inset 0 2px 0 rgba(212, 160, 23, 0.25)",
      }}
    >
      <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-4">
        <p className="font-quest text-[10px] tracking-widest text-quest-gold/90 sm:text-xs">
          ◆ QUEST LOG ◆
        </p>
        <h1 className="font-quest text-sm text-quest-cream quest-title-glow sm:text-base md:text-lg">
          BlogQuest ⚔️
        </h1>
        <p className="hidden font-body text-lg text-quest-parchment/80 sm:block">
          — B2B content strategy, retro style
        </p>
      </div>
    </header>
  );
}
