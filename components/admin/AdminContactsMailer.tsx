"use client";

import { useActionState, useDeferredValue, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Send,
  ShieldAlert,
  Users,
} from "lucide-react";
import {
  sendContactEmailAction,
  type AdminContactMailActionState,
} from "@/app/admin/contacts/actions";
import type { RegistrationEmailContact } from "@/lib/messaging-contacts";

const IDLE: AdminContactMailActionState = {
  status: "idle",
  message: null,
  toastKey: 0,
};

function ContactMailNotice({
  state,
}: {
  state: AdminContactMailActionState;
}) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const isSuccess = state.status === "success";

  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
        isSuccess
          ? "border-emerald-500/20 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
          : "border-rose-500/20 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <p className="leading-6">{state.message}</p>
      </div>
    </div>
  );
}

function SendEmailButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {pending ? "Queueing email..." : "Send email"}
    </button>
  );
}

function contactMatchesQuery(contact: RegistrationEmailContact, query: string) {
  if (!query) return true;

  const haystack = [
    contact.name ?? "",
    contact.email,
    contact.lastFormTitle ?? "",
  ]
    .join(" ")
    .toLocaleLowerCase("en-US");

  return haystack.includes(query);
}

function formatLastSubmittedAt(value: string | null) {
  if (!value) return "Not yet synced";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminContactsMailer({
  contacts,
}: {
  contacts: RegistrationEmailContact[];
}) {
  const [state, dispatch] = useActionState(sendContactEmailAction, IDLE);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [recipientMode, setRecipientMode] = useState<"selected" | "all">("selected");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const query = deferredSearch.trim().toLocaleLowerCase("en-US");
  const filteredContacts = contacts.filter((contact) => contactMatchesQuery(contact, query));

  const selectedVisibleCount = filteredContacts.filter((contact) =>
    selectedContactIds.includes(contact.id),
  ).length;
  const allVisibleSelected =
    filteredContacts.length > 0 && selectedVisibleCount === filteredContacts.length;
  const hasMessageContent = subject.trim().length > 0 && content.trim().length > 0;
  const canSend =
    hasMessageContent &&
    (recipientMode === "all"
      ? contacts.length > 0
      : selectedContactIds.length > 0);

  function toggleContact(contactId: string) {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId],
    );
  }

  function toggleAllVisible() {
    setSelectedContactIds((current) => {
      const visibleIds = filteredContacts.map((contact) => contact.id);

      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  if (contacts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            No synced contacts yet
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Contacts are created automatically when a user submits a registration form that has
            confirmation emails enabled. Once registrations start coming in, you can send email to
            everyone here or only to selected contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-6">
      <input
        type="hidden"
        name="recipientMode"
        value={recipientMode}
      />
      <input
        type="hidden"
        name="selectedContactIdsJson"
        value={JSON.stringify(selectedContactIds)}
      />

      <div className="space-y-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Contacts & Email
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Send a custom Appwrite email to every synced contact or only the people you select from
            the registration contact list.
          </p>
        </div>
        <ContactMailNotice state={state} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Synced contacts
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {contacts.length} total contacts
                  </p>
                </div>
              </div>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search contacts or forms"
                  className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 lg:w-72 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
                />
              </label>
            </div>
          </div>

          <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={toggleAllVisible}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    allVisibleSelected
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-400 text-transparent dark:border-zinc-600"
                  }`}
                >
                  ✓
                </span>
                {allVisibleSelected ? "Clear visible" : "Select visible"}
              </button>
              <span>
                {selectedContactIds.length} selected
              </span>
              <span>
                {filteredContacts.length} shown
              </span>
            </div>
          </div>

          <div className="max-h-[36rem] overflow-y-auto">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggleContact(contact.id)}
                    className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors ${
                      isSelected
                        ? "bg-zinc-100/70 dark:bg-zinc-800/80"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-950"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                          : "border-zinc-300 text-transparent dark:border-zinc-700"
                      }`}
                    >
                      ✓
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {contact.name || "Unnamed contact"}
                          </p>
                          <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                            {contact.email}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {formatLastSubmittedAt(contact.lastSubmittedAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Last form: {contact.lastFormTitle || "Unknown form"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="border-t border-zinc-200 px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              No contacts match your current search.
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Compose email
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Messages are sent through Appwrite Messaging.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Recipients
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                <input
                  type="radio"
                  checked={recipientMode === "selected"}
                  onChange={() => setRecipientMode("selected")}
                  className="mt-1 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-400"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Selected contacts
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Send only to the {selectedContactIds.length} contacts you checked in the list.
                  </p>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950">
                <input
                  type="radio"
                  checked={recipientMode === "all"}
                  onChange={() => setRecipientMode("all")}
                  className="mt-1 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-400"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    All contacts
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Send to all {contacts.length} synced contacts at once.
                  </p>
                </div>
              </label>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Enter the email subject"
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Message
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write the message you want to send. Paragraph breaks are preserved in the email."
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400"
              />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              {recipientMode === "all"
                ? `This email will be sent to all ${contacts.length} synced contacts.`
                : `This email will be sent to ${selectedContactIds.length} selected contact${selectedContactIds.length === 1 ? "" : "s"}.`}
            </div>

            <SendEmailButton disabled={!canSend} />
          </div>
        </section>
      </div>
    </form>
  );
}
