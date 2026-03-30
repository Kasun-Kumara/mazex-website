import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { isAppwriteConfigured } from "@/lib/appwrite";
import { ThemeProvider } from "@/components/admin/ThemeProvider";
import { ThemeToggle } from "@/components/admin/ThemeToggle";

export default async function LoginPage() {
  const currentAdmin = await getCurrentAdmin();

  if (currentAdmin) {
    redirect("/admin");
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <main className="min-h-screen flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">
            MazeX Admin
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to access the dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
            <AdminLoginForm authConfigured={isAppwriteConfigured()} />
          </div>
        </div>
      </main>
    </ThemeProvider>
  );
}
