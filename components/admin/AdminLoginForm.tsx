"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/app/login/actions";

const initialState: AdminLoginState = {
  error: null,
  toastKey: 0,
};

const noticeCopy: Record<
  string,
  {
    icon: typeof ShieldAlert;
    message: string;
    className: string;
  }
> = {
  misconfigured: {
    icon: ShieldAlert,
    message:
      "Admin auth is not configured yet. Add the required environment variables before using this login.",
    className:
      "border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-100",
  },
  unauthorized: {
    icon: ShieldAlert,
    message:
      "Your session is missing the required admin access. Sign in again with a verified admin account.",
    className:
      "border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100",
  },
  "signed-out": {
    icon: ShieldCheck,
    message: "The admin session has been signed out.",
    className:
      "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  },
  "password-updated": {
    icon: ShieldCheck,
    message: "Password changed successfully. Sign in with your new password.",
    className:
      "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  },
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Signing In..." : disabled ? "Configure Admin Auth First" : "Sign In"}
    </button>
  );
}

type LoginToast = {
  id: string;
  icon: typeof ShieldAlert;
  message: string;
  className: string;
};

function LoginToastMessage({
  toast,
  onClose,
}: {
  toast: LoginToast;
  onClose: () => void;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [onClose, toast.id]);

  return (
    <div
      className={`fixed top-4 right-4 left-4 z-50 mx-auto flex w-auto max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl sm:right-6 sm:left-auto ${toast.className}`}
      role="status"
      aria-live="polite"
    >
      <toast.icon className="h-5 w-5 shrink-0 mt-0.5" />
      <p className="flex-1 pr-2 leading-tight">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AdminLoginForm({
  authConfigured,
}: {
  authConfigured: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null);
  const [state, formAction] = useActionState(loginAdminAction, initialState);
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";
  const notice = noticeCopy[reason];
  const activeToast = state.error
    ? {
        id: `error:${state.toastKey}`,
        icon: ShieldAlert,
        message: state.error,
        className: "border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-100",
      }
    : notice
      ? {
          id: `notice:${reason}`,
          icon: notice.icon,
          message: notice.message,
          className: notice.className,
        }
      : null;
  const visibleToast =
    activeToast && activeToast.id !== dismissedToastId ? activeToast : null;

  return (
    <>
      {visibleToast ? (
        <LoginToastMessage
          toast={visibleToast}
          onClose={() => setDismissedToastId(visibleToast.id)}
        />
      ) : null}

      <form action={formAction} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@mazex.org"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full pl-10 sm:text-sm rounded-md h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
            />
          </div>
        </div>

        <div>
           <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Password
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockKeyhole className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
               className="block w-full pl-10 pr-10 sm:text-sm rounded-md h-10 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 dark:focus:ring-zinc-400 dark:focus:border-zinc-400"
            />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <SubmitButton disabled={!authConfigured} />
      </form>
    </>
  );
}
