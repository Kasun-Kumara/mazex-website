"use client";

import { useMemo, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type {
  FieldDefinition,
  FieldOption,
  FormAvailability,
  FormWithFields,
} from "@/lib/registration-types";
import {
  submitRegistrationAction,
  type SubmitRegistrationState,
} from "@/app/[slug]/actions";

const initialState: SubmitRegistrationState = {
  status: "idle",
  message: null,
  fieldErrors: {},
  toastKey: 0,
};

function fieldInputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-white/[0.03] px-4 py-3.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 hover:bg-white/[0.04] focus:bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] ${
    hasError
      ? "border-rose-400/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/50"
      : "border-white/10 hover:border-white/15 focus:border-white/25 focus:ring-1 focus:ring-white/10"
  }`;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="theme-button theme-button-register inline-flex w-full items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Submitting…" : "Submit registration"}
    </button>
  );
}

function FieldHint({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-[13px] leading-5 text-rose-300">{error}</p>
    </div>
  );
}

import { Check, ChevronDown, UploadCloud, File } from "lucide-react";

function ChoiceField({
  field,
  options,
  name,
  error,
  defaultValue,
}: {
  field: FieldDefinition;
  options: FieldOption[];
  name: string;
  error?: string;
  defaultValue?: string | string[];
}) {
  if (field.type === "select") {
    return (
      <div className="relative">
        <select 
          name={name} 
          id={name} 
          defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
          className={`${fieldInputClass(Boolean(error))} appearance-none pr-10`}
        >
          <option value="" className="bg-slate-900 text-slate-400">Select an option...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-slate-900 text-slate-100">
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
        <FieldHint error={error} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.03]">
        {options.map((o) => (
          <label
            key={o.value}
            className="group relative flex cursor-pointer items-start gap-4"
          >
            <div className="relative mt-0.5 h-5 w-5 shrink-0">
              <input
                type={field.type === "radio" ? "radio" : "checkbox"}
                name={name}
                value={o.value}
                defaultChecked={
                  field.type === "checkbox"
                    ? Array.isArray(defaultValue)
                      ? defaultValue.includes(o.value)
                      : defaultValue === o.value
                    : defaultValue === o.value
                }
                className="peer sr-only"
              />
              {field.type === "checkbox" ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-[6px] border-2 border-white/20 bg-white/5 text-transparent transition-all peer-checked:border-white peer-checked:bg-white peer-checked:text-[#020617] group-hover:border-white/40">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 transition-all peer-checked:border-white group-hover:border-white/40" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100">
                    <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
                  </div>
                </>
              )}
            </div>
            <span className="text-base leading-snug text-slate-300 transition-colors group-hover:text-white">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      <FieldHint error={error} />
    </>
  );
}

function ClientFileField({
  name,
  field,
  error,
  label,
}: {
  name: string;
  field: FieldDefinition;
  error?: string;
  label: React.ReactNode;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div>
      {label}
      <div
        className={`group relative mt-2 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-white/[0.015] px-6 py-8 text-center transition-all hover:bg-white/[0.03] focus-within:ring-2 focus-within:ring-white/20 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 ${
          error ? "border-rose-400/50" : "border-white/10 hover:border-white/25"
        }`}
      >
        <input
          id={name}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;
            setFile(selectedFile);
            if (selectedFile && selectedFile.type.startsWith("image/")) {
              setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
              setPreviewUrl(null);
            }
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div className="pointer-events-none flex flex-col items-center justify-center">
          {file ? (
            <>
              {previewUrl ? (
                <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-xl border border-white/10 shadow-lg ring-1 ring-white/20 sm:h-32 sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt={file.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                </div>
              ) : (
                <div className="mb-4 rounded-full bg-emerald-500/10 p-3.5 text-emerald-400 ring-1 ring-emerald-500/30 transition-transform group-hover:scale-105">
                  <File className="h-6 w-6" />
                </div>
              )}
              <p className="truncate px-4 text-[15px] font-medium text-slate-200">
                {file.name}
              </p>
              <p className="mt-1 text-[13px] text-emerald-500/80">
                File attached successfully
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 rounded-full bg-white/5 p-3.5 text-slate-400 ring-1 ring-white/10 transition-transform group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-[15px] font-medium text-slate-200">
                Click to attach or drag & drop
              </p>
              <p className="mt-1.5 text-[13px] text-slate-500">
                Supports common file formats up to 10MB
              </p>
            </>
          )}
        </div>
      </div>
      <FieldHint error={error} />
    </div>
  );
}

function RenderField({
  field,
  name,
  error,
  defaultValue,
}: {
  field: FieldDefinition;
  name: string;
  error?: string;
  defaultValue?: string | string[];
}) {
  const label = (
    <label
      htmlFor={field.type === "radio" ? undefined : name}
      className="mb-3 block text-base font-semibold tracking-wide text-slate-100"
    >
      {field.label}
      {field.required ? (
        <span className="ml-1 text-rose-400">*</span>
      ) : (
        <span className="ml-3 text-xs font-medium uppercase tracking-wider text-slate-400">
          Optional
        </span>
      )}
    </label>
  );

  if (field.type === "select" || field.type === "radio" || field.type === "checkbox") {
    return (
      <div>
        {label}
        <ChoiceField field={field} name={name} options={field.options} error={error} defaultValue={defaultValue} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea
          id={name}
          name={name}
          rows={4}
          defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
          className={`${fieldInputClass(Boolean(error))} min-h-[100px] resize-y scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20`}
        />
        <FieldHint error={error} />
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <ClientFileField name={name} field={field} error={error} label={label} />
    );
  }

  return (
    <div>
      {label}
      <input
        id={name}
        name={name}
        type={field.type}
        defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
        className={fieldInputClass(Boolean(error))}
      />
      <FieldHint error={error} />
    </div>
  );
}

export default function PublicRegistrationForm({
  form,
  availability,
  slug,
}: {
  form: FormWithFields;
  availability: FormAvailability;
  slug: string;
}) {
  const [state, setState] = useState(initialState);
  const [memberCount, setMemberCount] = useState(form.teamMinMembers);

  const formAction = async (formData: FormData) => {
    const result = await submitRegistrationAction(state, formData);
    setState(result);
  };

  const submissionFields = useMemo(
    () => form.fields.filter((f) => f.scope === "submission"),
    [form.fields],
  );
  const memberFields = useMemo(
    () => form.fields.filter((f) => f.scope === "member"),
    [form.fields],
  );
  const memberIndexes = useMemo(
    () => Array.from({ length: memberCount }, (_, i) => i),
    [memberCount],
  );

  if (state.status === "success") {
    return (
      <div className="relative flex flex-col items-center justify-center overflow-hidden p-12 py-24 text-center sm:p-16">
        {/* Soft glowing background effect purely for the success state */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />
        </div>

        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <Check className="h-10 w-10 stroke-[2.5]" />
        </div>
        
        <h2 className="relative mt-8 text-3xl font-bold tracking-tight text-white sm:text-5xl">
          You're all set!
        </h2>
        
        <p className="relative mt-4 max-w-lg text-lg leading-relaxed text-slate-300">
          {state.message}
        </p>
        
        <div className="relative mt-12 flex flex-col justify-center gap-4 w-full sm:w-auto sm:flex-row">
          <Link
            href="/#register"
            className="theme-button inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-[15px] font-semibold tracking-wide shadow-[0_0_20px_rgba(107,82,143,0.4)] transition-all hover:scale-105 sm:w-auto"
          >
            Explore more events
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-[15px] font-semibold tracking-wide text-white backdrop-blur-md transition-all hover:bg-white/[0.08] sm:w-auto"
          >
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 lg:p-12">
      <form action={formAction} className="space-y-10" noValidate>
        <input type="hidden" name="slug" value={slug} />

        {state.status === "error" && state.message && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200 backdrop-blur-sm">
            {state.message}
          </div>
        )}

        {submissionFields.length === 0 && !availability.isAcceptingSubmissions ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-8 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-amber-200">{availability.label}</p>
            {availability.description && (
              <p className="mt-2 text-sm text-amber-300/80">{availability.description}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-y-7">
              {submissionFields.map((field) => {
                const name = `submission__${field.key}`;
                return (
                  <div key={field.id}>
                    <RenderField
                      field={field}
                      name={name}
                      error={state.fieldErrors[name]}
                      defaultValue={state.fields?.[name]}
                    />
                  </div>
                );
              })}
            </div>

            {memberFields.length > 0 && (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.015] p-6 shadow-inner sm:p-8">
                {/* Subtle soft glow in the container */}
                <div className="absolute left-1/4 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-white/5 opacity-40 blur-3xl" />
                
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-300 ring-1 ring-white/10">
                      Team Details
                    </span>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">
                      Competition Members
                    </h3>
                    <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-slate-400">
                      Enter the information for each participant. Team size: {form.teamMinMembers}–
                      {form.teamMaxMembers}.
                    </p>
                  </div>

                  <div className="w-full max-w-[16rem]">
                    <label
                      htmlFor="memberCount"
                      className="mb-3 block text-base font-semibold tracking-wide text-slate-100"
                    >
                      How many members?
                    </label>
                    <select
                      id="memberCount"
                      name="memberCount"
                      value={memberCount}
                      onChange={(e) => setMemberCount(Number(e.target.value))}
                      className={fieldInputClass(Boolean(state.fieldErrors.memberCount))}
                    >
                      {Array.from(
                        { length: form.teamMaxMembers - form.teamMinMembers + 1 },
                        (_, i) => form.teamMinMembers + i,
                      ).map((v) => (
                        <option key={v} value={v} className="bg-slate-900 text-slate-100">
                          {v} {v === 1 ? "member" : "members"}
                        </option>
                      ))}
                    </select>
                    {state.fieldErrors.memberCount && (
                      <p className="mt-2 text-[13px] text-rose-300">
                        {state.fieldErrors.memberCount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative mt-8 space-y-8">
                  {memberIndexes.map((i) => (
                    <div
                      key={i}
                      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.03] sm:p-7"
                    >
                      <h4 className="flex items-center gap-3 text-lg font-semibold text-white">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold ring-1 ring-white/20">
                          {i + 1}
                        </span>
                        Member {i + 1}
                      </h4>
                      <div className="mt-6 flex flex-col gap-y-7">
                        {memberFields.map((field) => {
                          const name = `member__${i}__${field.key}`;
                          return (
                            <div key={`${field.id}-${i}`}>
                              <RenderField
                                field={field}
                                name={name}
                                error={state.fieldErrors[name]}
                                defaultValue={state.fields?.[name]}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <div className="flex flex-col items-center justify-between gap-5 sm:flex-row sm:gap-6">
                <SubmitButton disabled={!availability.isAcceptingSubmissions} />
                {!availability.isAcceptingSubmissions && (
                  <p className="text-sm font-medium text-amber-300">
                    This form is currently {availability.label.toLowerCase()}.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
