"use server";

import { redirect } from "next/navigation";
import { destroyCurrentAdminSession } from "@/lib/admin-auth";

export async function logoutAdminAction() {
  await destroyCurrentAdminSession();
  redirect("/login?reason=signed-out");
}
