import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AnalysisPanel } from "@/components/demo/analysis-panel";

export const metadata: Metadata = {
  title: "Demo - Video Analiz",
  description: "Video analiz modulu (demo).",
};

export default async function DemoAnalyzePage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-0 lg:p-0">
      <div className="h-[calc(100vh-64px)] min-h-[720px]">
        <AnalysisPanel />
      </div>
    </main>
  );
}

