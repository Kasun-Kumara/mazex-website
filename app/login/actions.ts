"use server";

import { redirect } from "next/navigation";
import {
  authenticateAdmin,
  persistAdminSessionCookie,
} from "@/lib/admin-auth";

export type AdminLoginState = {
  error: string | null;
  toastKey: number;
};

export async function loginAdminAction(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Enter your email and password to continue.",
      toastKey: Date.now(),
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      error: "Enter your email and password to continue.",
      toastKey: Date.now(),
    };
  }

  const result = await authenticateAdmin(normalizedEmail, password);

  if (!result.ok) {
    return {
      error: result.message,
      toastKey: Date.now(),
    };
  }

  await persistAdminSessionCookie(result.sessionSecret, result.sessionExpiresAt);
  redirect("/admin");
}
