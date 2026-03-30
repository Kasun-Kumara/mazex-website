import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import HexBackground from "@/components/HexBackground";
import Navbar from "@/components/Navbar";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { isAppwriteConfigured } from "@/lib/appwrite";

export default async function LoginPage() {
  const currentAdmin = await getCurrentAdmin();

  if (currentAdmin) {
    redirect("/admin");
  }

  return (
    <>
      <Navbar />
      <main className="site-shell">
        <div aria-hidden="true" className="site-background">
          <div className="site-background-glow site-background-glow-primary" />
          <div className="site-background-glow site-background-glow-secondary" />
          <div className="site-background-glow site-background-glow-tertiary" />
          <HexBackground opacity={0.18} />
        </div>

        <section className="theme-section relative min-h-screen overflow-hidden pt-24 pb-12 sm:pt-32 sm:pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.08),transparent_30%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
              <div className="w-full max-w-md rounded-2xl border border-[#221a31] bg-[#08060f] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.45)] sm:p-9">
                <div className="space-y-3">
                  <span className="theme-chip text-[11px] font-bold uppercase tracking-[0.28em]">
                    Admin Login
                  </span>
                  <h2 className="text-3xl font-semibold tracking-tight text-[#F8FAFC]">
                    Welcome back
                  </h2>
                  <p className="theme-copy text-sm">
                    Sign in to continue to the MazeX admin dashboard.
                  </p>
                </div>

                <AdminLoginForm authConfigured={isAppwriteConfigured()} />
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
