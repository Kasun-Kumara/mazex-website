"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, KeyRound, ShieldAlert, X } from "lucide-react";
import {
  changeAdminPasswordAction,
  type ChangeAdminPasswordState,
} from "@/app/admin/actions";

const initialState: ChangeAdminPasswordState = {
  error: null,
  toastKey: 0,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-900"
    >
      {pending ? "Changing password..." : "Change password"}
    </button>
  );
}

function Field({
  id,
  label,
  name,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>

      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <KeyRound className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
        </div>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block h-10 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-10 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((current) => !current)}
            className="text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none dark:hover:text-zinc-300"
          >
            {visible ? (
              <EyeOff className="h-4.5 w-4.5" />
            ) : (
              <Eye className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null);
  const [state, formAction] = useActionState(
    changeAdminPasswordAction,
    initialState,
  );

  const activeToast = useMemo(
    () =>
      state.error
        ? {
            id: `error:${state.toastKey}`,
            message: state.error,
          }
        : null,
    [state.error, state.toastKey],
  );

  useEffect(() => {
    if (!activeToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDismissedToastId(activeToast.id);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [activeToast]);

  const visibleToast =
    activeToast && activeToast.id !== dismissedToastId ? activeToast : null;

  return (
    <>
      {visibleToast ? (
        <div
          className="fixed left-4 right-4 top-4 z-50 mx-auto flex w-auto max-w-sm items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-50 px-4 py-3 text-sm text-rose-900 shadow-xl sm:left-auto sm:right-6 dark:bg-rose-500/10 dark:text-rose-100"
          role="status"
          aria-live="polite"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="flex-1 pr-2 leading-tight">{visibleToast.message}</p>
          <button
            type="button"
            onClick={() => setDismissedToastId(visibleToast.id)}
            aria-label="Close notification"
            className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-2xl px-4 sm:px-0">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="max-w-xl">
            <div className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              Settings
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
              Change password
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Enter your current password, set a new one, and confirm it. After
              the password changes successfully, the current admin session will
              be signed out automatically and redirected to the login page.
            </p>
          </div>

          <form action={formAction} className="mt-8 space-y-5">
            <Field
              id="currentPassword"
              label="Current password"
              name="currentPassword"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <Field
              id="newPassword"
              label="New password"
              name="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <Field
              id="confirmPassword"
              label="Confirm new password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            <SubmitButton />
          </form>
        </div>
      </div>
    </>
  );
}
