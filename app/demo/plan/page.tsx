import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PlanningPanel } from "@/components/demo/planning-panel";

export const metadata: Metadata = {
  title: "Demo - Video Planlama",
  description: "Video planlama modulu (demo).",
};

export default async function DemoPlanPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-0 lg:p-0">
      <div className="h-[calc(100vh-64px)] min-h-[720px]">
        <PlanningPanel />
      </div>
    </main>
  );
}

