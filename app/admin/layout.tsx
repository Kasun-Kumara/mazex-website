import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { isAppwriteConfigured } from "@/lib/appwrite";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isAppwriteConfigured()) {
    redirect("/login?reason=misconfigured");
  }

  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    redirect("/login?reason=unauthorized");
  }

  return children;
}
