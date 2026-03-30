"use client";

import { useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { openOptimisticDrawer } from "./OptimisticSubmissionDrawer";

export default function SubmissionRowInteractive({
  href,
  isActive,
  submissionId,
  children,
}: {
  href: string;
  isActive: boolean;
  submissionId: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) return;

    // Instantly slide up the optimistic loading drawer from the global portal
    openOptimisticDrawer(submissionId);

    // Tell Next.js to start loading the route in the background
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  return (
    <div
      onClick={handleClick}
      className={`block rounded-lg border p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer ${
        isActive
          ? "border-zinc-900 bg-zinc-50/50 dark:border-zinc-400 dark:bg-zinc-900/50 shadow-sm"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <div className={`transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
        {children}
      </div>
    </div>
  );
}
