import { DemoNavbar } from "@/components/demo-navbar";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <DemoNavbar />

      {/* Main Content Space adjusted for floating fixed header */}
      <div className="flex-1 mt-24">{children}</div>
    </div>
  );
}
