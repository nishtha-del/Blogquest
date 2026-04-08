import { QuestSidebar } from "@/components/QuestSidebar";
import { QuestTopBar } from "@/components/QuestTopBar";

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <QuestSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-quest-parchment/40">
        <QuestTopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div
            className="mx-auto max-w-6xl rounded-sm border-4 border-quest-brown bg-quest-cream p-4 shadow-pixel-outer md:p-6"
            style={{
              boxShadow:
                "0 0 0 2px #f0c040, 0 0 0 4px #5c3d11, 0 0 0 6px #2c1a0e, 6px 6px 0 0 #1a0f08, inset 0 0 0 1px rgba(92, 61, 17, 0.35)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
