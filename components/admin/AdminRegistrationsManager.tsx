"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Reorder } from "framer-motion";
import {
  CheckCircle2, ExternalLink, FileImage, GripHorizontal,
  Loader2, Plus, Settings2, ShieldAlert, Trash2, X, ChevronDown,
} from "lucide-react";
import FormSelectorDropdown from "@/components/admin/FormSelectorDropdown";
import {
  createRegistrationFormAction,
  deleteFormBannerAction,
  deleteRegistrationFormAction,
  updateRegistrationFormSettingsAction,
  uploadFormBannerAction,
  bulkSaveRegistrationFieldsAction,
  type RegistrationAdminActionState,
} from "@/app/admin/registrations/actions";
import { formatOptionsForTextarea } from "@/lib/registration-display";
import type {
  FieldDefinition, FieldType, FieldScope,
  FormDefinition, FormWithFields,
} from "@/lib/registration-types";
import { MAX_REGISTRATION_FORMS, REGISTRATION_FORM_KINDS } from "@/lib/registration-types";

// ─── Constants ────────────────────────────────────────────────────────────────
const IDLE: RegistrationAdminActionState = { status: "idle", message: null, toastKey: 0 };

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Short answer", textarea: "Paragraph", email: "Email",
  tel: "Phone", number: "Number", select: "Dropdown",
  radio: "Radio input", checkbox: "Checkbox", date: "Date",
  time: "Time", file: "File Upload",
};

const ALL_TYPES = Object.keys(TYPE_LABELS) as FieldType[];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function localDt(v: string | null) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ state, onClose }: { state: RegistrationAdminActionState; onClose: () => void }) {
  if (state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <div role="status" className={`fixed left-4 right-4 top-4 z-50 mx-auto flex w-auto max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-xl sm:left-auto sm:right-6 ${ok ? "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />}
      <p className="flex-1 pr-2 leading-tight">{state.message}</p>
      <button type="button" onClick={onClose} aria-label="Close notification" className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md transition hover:bg-black/5 dark:hover:bg-white/10"><X className="h-4 w-4" /></button>
    </div>
  );
}

function useToast(state: RegistrationAdminActionState) {
  const [key, setKey] = useState<number | null>(null);
  const visible = state.status !== "idle" && state.message && state.toastKey !== key ? state : null;
  return { visible, dismiss: () => setKey(state.toastKey) };
}


// ─── Create Form Panel ────────────────────────────────────────────────────────
function CreateFormPanel({ formCount, onCancel }: { formCount: number; onCancel: () => void }) {
  const [state, dispatch] = useActionState(createRegistrationFormAction, IDLE);
  const toast = useToast(state);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  return (
    <>
      {toast.visible && <Toast state={toast.visible} onClose={toast.dismiss} />}
      <div className="mx-auto max-w-xl px-4 sm:px-0 mt-8">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-2 w-full bg-zinc-900 dark:bg-zinc-100" />
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create registration form</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{formCount} of {MAX_REGISTRATION_FORMS} forms used</p>
            <form action={dispatch} className="mt-6 space-y-5">
              <div>
                <input name="title" type="text" placeholder="Form title" value={title} required
                  onChange={e => { setTitle(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")); }}
                  className="block w-full border-0 border-b-2 border-zinc-200 bg-transparent px-0 py-2 text-xl font-bold text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 dark:border-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-600 dark:focus:border-zinc-400" />
              </div>
              <div>
                <select name="kind" className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400">
                  {REGISTRATION_FORM_KINDS.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
                </select>
              </div>
              <div>
                 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Slug — <span className="font-normal normal-case tracking-normal">yoursite.com/{slug || "…"}</span>
                </label>
                <input name="slug" type="text" value={slug} required
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+/, ""))}
                   className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
              </div>
              {state.status === "error" && <p className="text-sm text-rose-600 dark:text-rose-400">{state.message}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 transition-colors">Create form</button>
                <button type="button" onClick={onCancel} className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus:ring-zinc-300 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Banner upload ────────────────────────────────────────────────────────────
function BannerArea({ form, bannerUrl }: { form: FormDefinition; bannerUrl: string | null }) {
  const [uploadState, uploadDispatch] = useActionState(uploadFormBannerAction, IDLE);
  const [deleteState, deleteDispatch] = useActionState(deleteFormBannerAction, IDLE);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative overflow-hidden w-full border-b border-zinc-200 dark:border-zinc-800">
      {bannerUrl ? (
        <div className="relative h-40 w-full group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <form action={uploadDispatch} ref={formRef}>
              <input type="hidden" name="formId" value={form.id} />
              <input ref={fileRef} type="file" name="banner" accept="image/*" className="hidden"
                onChange={() => formRef.current?.requestSubmit()} />
              <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/30 transition-colors border border-white/20">
                Replace banner
              </button>
            </form>
            <form action={deleteDispatch}>
              <input type="hidden" name="formId" value={form.id} />
              <button type="submit" className="rounded-md bg-rose-500/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-rose-500 transition-colors border border-rose-500/20">Remove</button>
            </form>
          </div>
        </div>
      ) : (
        <form action={uploadDispatch} ref={formRef}>
          <input type="hidden" name="formId" value={form.id} />
          <input ref={fileRef} type="file" name="banner" accept="image/*" className="hidden"
            onChange={() => formRef.current?.requestSubmit()} />
          <button type="button" onClick={() => fileRef.current?.click()}
             className="flex h-20 w-full items-center justify-center gap-2 bg-zinc-50 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
            <FileImage className="h-4 w-4" /> Add banner image
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Settings Panel (collapsible) ─────────────────────────────────────────────
function SettingsPanel({ form }: { form: FormWithFields }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slug, setSlug] = useState(form.slug);
  const [settingsState, settingsDispatch] = useActionState(updateRegistrationFormSettingsAction, IDLE);
  const [deleteState, deleteDispatch] = useActionState(deleteRegistrationFormAction, IDLE);
  const st = useToast(settingsState);
  const dt = useToast(deleteState);
  const toast = st.visible ?? dt.visible;

  const [formVersion, setFormVersion] = useState(form.id + ":" + form.slug);
  if (form.id + ":" + form.slug !== formVersion) {
    setFormVersion(form.id + ":" + form.slug);
    setSlug(form.slug);
    setConfirmDelete(false);
  }

  return (
    <>
      {toast && <Toast state={toast} onClose={st.visible ? st.dismiss : dt.dismiss} />}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
           <span className="flex items-center gap-2 font-semibold"><Settings2 className="h-4 w-4" /> Form settings</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
           <form action={settingsDispatch} className="border-t border-zinc-200 px-6 pb-6 pt-4 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <input type="hidden" name="formId" value={form.id} />
             <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Form Title</label>
                 <input name="title" defaultValue={form.title} required
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Slug — <span className="font-normal normal-case">yoursite.com/{slug || "…"}</span>
                  <a href={`/${slug}`} target="_blank" className="ml-2 inline-flex text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"><ExternalLink className="h-3 w-3" /></a>
                </label>
                <input name="slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+/, ""))}
                   className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</label>
                 <select name="status" defaultValue={form.status} className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400">
                  <option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option>
                </select>
              </div>
               <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Min / Max members</label>
                <div className="flex gap-2">
                  <input name="teamMinMembers" type="number" min={1} max={50} defaultValue={form.teamMinMembers} disabled={form.kind !== "competition"}
                     className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
                  <input name="teamMaxMembers" type="number" min={1} max={50} defaultValue={form.teamMaxMembers} disabled={form.kind !== "competition"}
                     className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Opens at</label>
                <input type="datetime-local" defaultValue={localDt(form.openAt)}
                  onChange={e => {
                    const hidden = e.target.nextElementSibling as HTMLInputElement;
                    hidden.value = e.target.value ? new Date(e.target.value).toISOString() : "";
                  }}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
                <input type="hidden" name="openAt" defaultValue={form.openAt || ""} />
              </div>
              <div>
                 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Closes at</label>
                <input type="datetime-local" defaultValue={localDt(form.closeAt)}
                  onChange={e => {
                    const hidden = e.target.nextElementSibling as HTMLInputElement;
                    hidden.value = e.target.value ? new Date(e.target.value).toISOString() : "";
                  }}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
                <input type="hidden" name="closeAt" defaultValue={form.closeAt || ""} />
              </div>
              <div className="sm:col-span-2">
                 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description</label>
                <input name="description" type="text" defaultValue={form.description ?? ""}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
              </div>
              <div className="sm:col-span-2">
                 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Success message</label>
                <textarea name="successMessage" rows={3} defaultValue={form.successMessage ?? ""}
                  className="block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 sm:text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400" />
              </div>
            </div>

            {settingsState.status === "error" && <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{settingsState.message}</p>}

             <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
               <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 transition-colors">Save settings</button>
              {confirmDelete ? (
                <form action={deleteDispatch} className="flex items-center gap-2">
                  <input type="hidden" name="formId" value={form.id} />
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400 ml-2">Delete data?</span>
                  <button type="submit" className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 transition-colors">Yes, delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors">Cancel</button>
                </form>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="h-4 w-4" /> Delete form
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}

// ─── Option input list (for select/radio cards) ───────────────────────────────
type Opt = { id: string; label: string; value: string };
function OptionList({ type, options, onChange }: {
  type: FieldType; options: Opt[]; onChange: (opts: Opt[]) => void;
}) {
  const icon = type === "radio" ? "○" : type === "checkbox" ? "□" : "☰";

  function update(id: string, label: string) {
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || id;
    onChange(options.map(o => o.id === id ? { ...o, label, value } : o));
  }

  function add() {
    const n = options.length + 1;
    const id = `opt-${Date.now()}`;
    onChange([...options, { id, label: `Option ${n}`, value: `option_${n}` }]);
  }

  function remove(id: string) {
    onChange(options.filter(o => o.id !== id));
  }

  return (
    <div className="mt-4 space-y-2">
      {options.map(o => (
        <div key={o.id} className="flex items-center gap-3 group">
          <span className="w-4 shrink-0 text-center text-zinc-400 dark:text-zinc-500 font-medium">{icon}</span>
          <input value={o.label} onChange={e => update(o.id, e.target.value)}
            className="flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-0 group-hover:border-zinc-300 dark:text-zinc-50 dark:focus:border-zinc-400 dark:group-hover:border-zinc-700 transition-colors" />
          <button type="button" onClick={() => remove(o.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-3 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mt-2">
        <span className="w-4 text-center font-medium text-zinc-400">{icon}</span>
        <span>Add option</span>
      </button>
    </div>
  );
}

// ─── Field Preview (non-choice types) ────────────────────────────────────────
function FieldPreview({ type }: { type: FieldType }) {
  if (type === "text" || type === "email" || type === "tel" || type === "number" || type === "date" || type === "time") {
    return <div className="mt-4 border-b border-dashed border-zinc-300 pb-2 dark:border-zinc-700 w-[60%]"><span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">{TYPE_LABELS[type]} answer</span></div>;
  }
  if (type === "textarea") {
    return <div className="mt-4 border-b border-dashed border-zinc-300 pb-6 dark:border-zinc-700 w-full"><span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Long answer text</span></div>;
  }
  if (type === "file") {
    return (
      <div className="mt-4 flex items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Click to upload file</span>
      </div>
    );
  }

  return null;
}

// ─── Google-style Field Card ──────────────────────────────────────────────────
function FieldCard({ field, onChange, onDelete }: {
  field: FieldDefinition;
  onChange: (field: FieldDefinition) => void;
  onDelete: () => void;
}) {
  const { label, type, scope, required, options } = field;
  const isChoiceType = type === "select" || type === "radio" || type === "checkbox";

  const update = (updates: Partial<FieldDefinition>) => {
    onChange({ ...field, ...updates });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-zinc-400">

      {/* Drag handle */}
      <div className="flex cursor-grab justify-center py-2 opacity-30 transition-opacity hover:opacity-100 active:cursor-grabbing bg-zinc-50 dark:bg-zinc-950/50">
        <GripHorizontal className="h-4 w-4 text-zinc-500" />
      </div>

      {/* Question row */}
      <div className="flex flex-col sm:flex-row items-start gap-4 px-6 pt-2 pb-4">
        <input value={label} onChange={e => {
            const newLabel = e.target.value;
            const newKey = newLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
            update({ label: newLabel, key: newKey });
          }}
          className="flex-1 w-full border-0 border-b-2 border-zinc-100 bg-transparent px-0 pb-2 text-base font-medium text-zinc-900 focus:border-zinc-900 focus:ring-0 dark:border-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-400"
          placeholder="Untitled question" />

        {/* Type selector */}
        <div className="relative shrink-0 w-full sm:w-48 mt-2 sm:mt-0">
          <select value={type} onChange={e => update({ type: e.target.value as FieldType })}
            className="block w-full appearance-none rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-400 dark:focus:ring-zinc-400">
            {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-zinc-500" />
        </div>
      </div>

      {/* Body: options or preview */}
      <div className="px-6 pb-6">
        {isChoiceType
          ? <OptionList type={type} options={(options || []).map((o, i) => ({ id: `o${i}`, ...o }))} onChange={(o) => update({ options: o.map((opt) => ({ label: opt.label, value: opt.value })) })} />
          : <FieldPreview type={type} />
        }
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-3 dark:border-zinc-800/80 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Per member</span>
            <button type="button" onClick={() => update({ scope: scope === "member" ? "submission" : "member" })}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${scope === "member" ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700"}`}>
              <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${scope === "member" ? "translate-x-4 dark:bg-zinc-900" : "translate-x-0.5"}`} />
            </button>
          </label>

          <div className="ml-auto flex items-center gap-6">
            <button type="button" onClick={onDelete} className="text-zinc-400 hover:text-rose-500 transition-colors" title="Delete Question">
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />

            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Required
              <button type="button" onClick={() => update({ required: !required })}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${required ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${required ? "translate-x-4 dark:bg-zinc-900" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Field Builder ────────────────────────────────────────────────────────────
function FieldBuilder({ form }: { form: FormWithFields }) {
  const [fields, setFields] = useState<FieldDefinition[]>(
    [...form.fields].sort((a, b) =>
      a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : a.label.localeCompare(b.label)
    )
  );
  const [fieldsVersion, setFieldsVersion] = useState(form.fields);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error", message: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (form.fields !== fieldsVersion) {
    setFieldsVersion(form.fields);
    setFields(
      [...form.fields].sort((a, b) =>
        a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : a.label.localeCompare(b.label)
      )
    );
    setIsDirty(false);
  }

  useEffect(() => {
    if (toastMsg) {
      const timeout = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [toastMsg]);

  function addQuestion() {
    setFields((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}`,
        formId: form.id,
        sortOrder: prev.length,
        label: "Untitled question",
        key: `untitled_question_${Date.now()}`,
        type: "text",
        scope: "submission",
        required: false,
        options: [{ id: "o0", label: "Option 1", value: "option_1" }],
      }
    ]);
    setIsDirty(true);
  }

  function handleReorder(newOrder: FieldDefinition[]) {
    // Sync the local order internally first
    setFields(newOrder.map((f, i) => ({ ...f, sortOrder: i })));
    setIsDirty(true);
  }

  async function handleBulkSave() {
    setIsSaving(true);
    setToastMsg(null);
    try {
      const payload = fields.map((f, i) => ({ ...f, sortOrder: i }));
      const res = await bulkSaveRegistrationFieldsAction(form.id, payload);
      if (res.status === "error") {
        setToastMsg({ type: "error", message: res.message || "Failed to save." });
      } else {
        setToastMsg({ type: "success", message: "Form fields saved successfully." });
        setIsDirty(false);
      }
    } catch (e) {
      setToastMsg({ type: "error", message: (e as Error).message || "Failed to save." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {toastMsg && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${toastMsg.type === "success" ? "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-rose-500/30 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-100"}`}>
          {toastMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          {toastMsg.message}
        </div>
      )}

      {isMounted && (
        <Reorder.Group axis="y" values={fields} onReorder={handleReorder} className="space-y-4">
          {fields.map((field) => (
            <Reorder.Item key={field.id} value={field}>
              <FieldCard 
                field={field} 
                onChange={(updated) => { setFields(fs => fs.map(f => f.id === field.id ? updated : f)); setIsDirty(true); }}
                onDelete={() => { setFields(fs => fs.filter(f => f.id !== field.id)); setIsDirty(true); }}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {isMounted && fields.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            No questions yet — click below to add your first
          </p>
        </div>
      )}

       <button
        type="button"
        onClick={addQuestion}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-white py-4 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
      >
        <Plus className="h-4 w-4" /> Add question
      </button>

      {/* Global Save Button */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 pr-4 shadow-2xl transition-all duration-300 dark:border-zinc-700 dark:bg-zinc-800 w-[90%] max-w-xl ${isMounted && isDirty ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}>
        <p className="pl-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">You have unsaved changes.</p>
        <button
          type="button"
          onClick={handleBulkSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:focus:ring-offset-zinc-800"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminRegistrationsManager({ forms, selectedForm, bannerUrl }: {
  forms: FormDefinition[];
  selectedForm: FormWithFields | null;
  bannerUrl: string | null;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const canCreate = forms.length < MAX_REGISTRATION_FORMS;

  if (showCreate || (forms.length === 0 && !selectedForm)) {
    return <CreateFormPanel formCount={forms.length} onCancel={() => setShowCreate(false)} />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-0 pb-20">
      {/* Form selector dropdown */}
      <FormSelectorDropdown
        items={forms.map((f) => ({
          id: f.id,
          title: f.title,
          href: `/admin/form-builder?form=${f.slug}`,
          status: f.status,
          kind: f.kind,
        }))}
        selectedId={selectedForm?.id}
        canCreate={canCreate}
        onNew={() => setShowCreate(true)}
      />

      {selectedForm ? (
        <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Banner */}
          <BannerArea form={selectedForm} bannerUrl={bannerUrl} />

           {/* Form title & kind */}
          <div className="px-6 py-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                 <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {selectedForm.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                     {selectedForm.kind}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${selectedForm.status === "open" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : selectedForm.status === "draft" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300" : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"}`}>
                    {selectedForm.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="hidden sm:inline">/</span>{selectedForm.slug}
                     <a href={`/${selectedForm.slug}`} target="_blank" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 ml-1 transition-colors" title="View live form">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
              <Link href={`/admin/registrations?form=${selectedForm.slug}`}
                className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-300 whitespace-nowrap">
                View responses
              </Link>
            </div>
          </div>

          {/* Settings */}
          <SettingsPanel form={selectedForm} />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Select a form above to edit it.</p>
        </div>
      )}

      {/* Questions */}
      {selectedForm && <FieldBuilder form={selectedForm} />}
    </div>
  );
}
