"use server";

import { AppwriteException, Storage, ID } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { AppwriteConfigError, createAppwriteAdminClient } from "@/lib/appwrite";
import {
  coerceFieldValue,
  createRegistrationSubmission,
  getDefaultSuccessMessage,
  getFormAvailability,
  getRegistrationFormBySlug,
  isRegistrationsConfigured,
  validateFieldValue,
} from "@/lib/registrations";
import type { SubmissionAnswerValue } from "@/lib/registration-types";

export type SubmitRegistrationState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors: Record<string, string>;
  fields?: Record<string, string | string[]>;
  toastKey: number;
};

const empty: Record<string, string> = {};

function buildState(
  status: SubmitRegistrationState["status"],
  message: string | null,
  fieldErrors: Record<string, string> = empty,
  fields?: Record<string, string | string[]>,
): SubmitRegistrationState {
  return { status, message, fieldErrors, toastKey: Date.now(), fields };
}

export async function submitRegistrationAction(
  _prev: SubmitRegistrationState,
  formData: FormData,
): Promise<SubmitRegistrationState> {
  const fieldsRecord: Record<string, string | string[]> = {};
  for (const [key, val] of Array.from(formData.entries())) {
    if (typeof val === "string") {
      if (fieldsRecord[key] !== undefined) {
        if (Array.isArray(fieldsRecord[key])) {
          (fieldsRecord[key] as string[]).push(val);
        } else {
          fieldsRecord[key] = [fieldsRecord[key] as string, val];
        }
      } else {
        fieldsRecord[key] = val;
      }
    }
  }
  const slugValue = formData.get("slug");
  const slug = typeof slugValue === "string" ? slugValue.trim() : "";
  if (!slug) return buildState("error", "Unable to determine which form to submit.", empty, fieldsRecord);

  const form = await getRegistrationFormBySlug(slug);
  if (!form) return buildState("error", "This registration form was not found.", empty, fieldsRecord);

  const availability = getFormAvailability(form);
  if (!availability.isAcceptingSubmissions) {
    return buildState(
      "error",
      availability.description
        ? `This form is not accepting submissions. ${availability.description}`
        : "This form is not accepting submissions right now.",
      empty,
      fieldsRecord,
    );
  }

  if (!isRegistrationsConfigured()) {
    return buildState(
      "error",
      "Registrations are not configured yet. Contact the administrator.",
      empty,
      fieldsRecord,
    );
  }

  const fieldErrors: Record<string, string> = {};
  const submissionFields = form.fields.filter((f) => f.scope === "submission" && f.type !== "page_break");
  const memberFields = form.fields.filter((f) => f.scope === "member" && f.type !== "page_break");
  const answers: Record<string, SubmissionAnswerValue> = {};

  for (const field of submissionFields) {
    const name = `submission__${field.key}`;
    const rawVal = field.type === "checkbox" ? formData.getAll(name) : formData.get(name);
    const value = coerceFieldValue(field, rawVal);
    const error = validateFieldValue(field, value);
    if (error) fieldErrors[name] = error;
    answers[field.key] = value;
  }

  const memberAnswers: Array<Record<string, SubmissionAnswerValue>> = [];

  if (memberFields.length > 0) {
    const rawCount = formData.get("memberCount");
    const memberCount = Number(typeof rawCount === "string" ? rawCount.trim() : "");

    if (
      !Number.isInteger(memberCount) ||
      memberCount < form.teamMinMembers ||
      memberCount > form.teamMaxMembers
    ) {
      fieldErrors.memberCount = `Team size must be between ${form.teamMinMembers} and ${form.teamMaxMembers}.`;
    } else {
      for (let i = 0; i < memberCount; i++) {
        const memberAnswer: Record<string, SubmissionAnswerValue> = {};
        for (const field of memberFields) {
          const name = `member__${i}__${field.key}`;
          const rawVal = field.type === "checkbox" ? formData.getAll(name) : formData.get(name);
          const value = coerceFieldValue(field, rawVal);
          const error = validateFieldValue(field, value);
          if (error) fieldErrors[name] = `Member ${i + 1}: ${error}`;
          memberAnswer[field.key] = value;
        }
        memberAnswers.push(memberAnswer);
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return buildState(
      "error",
      "Please fix the highlighted fields and try again.",
      fieldErrors,
      fieldsRecord,
    );
  }

  const primaryTeam  = null;

  // Upload any captured Files to Appwrite Storage and replace with file IDs.
  try {
    const client = createAppwriteAdminClient();
    const storage = new Storage(client);
    const bucketId = process.env.APPWRITE_BUCKET_REGISTRATION_FILES || "registration_files";

    const uploadFileIfPresent = async (record: Record<string, SubmissionAnswerValue>, key: string) => {
      const val = record[key];
      if (val instanceof File) {
        const uploaded = await storage.createFile(bucketId, ID.unique(), val);
        record[key] = uploaded.$id;
      }
    };

    // Upload main form answers
    const uploadPromises: Promise<void>[] = [];
    for (const key of Object.keys(answers)) uploadPromises.push(uploadFileIfPresent(answers, key));

    // Upload team member answers
    for (const member of memberAnswers) {
      for (const key of Object.keys(member)) uploadPromises.push(uploadFileIfPresent(member, key));
    }

    await Promise.all(uploadPromises);
  } catch (error) {
    console.error("File upload failed", error);
    return buildState("error", "Failed to upload one or more files. Please try again.", empty, fieldsRecord);
  }

  try {
    await createRegistrationSubmission({
      formId: form.id,
      answers,
      memberAnswers,
      teamName: primaryTeam,
    });
  } catch (error) {
    if (error instanceof AppwriteException) {
      if (error.code === 404)
        return buildState(
          "error",
          "Registration database not set up. Contact the administrator.",
          empty,
          fieldsRecord,
        );
      if ([401, 403].includes(error.code ?? 0))
        return buildState(
          "error",
          "Submission rejected due to a permissions error. Contact the administrator.",
          empty,
          fieldsRecord,
        );
      return buildState("error", error.message || "Unable to submit right now. Try again.", empty, fieldsRecord);
    }
    if (error instanceof AppwriteConfigError)
      return buildState("error", error.message, empty, fieldsRecord);
    return buildState("error", "Unable to submit right now. Please try again.", empty, fieldsRecord);
  }

  revalidatePath("/");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/registrations");

  return buildState("success", getDefaultSuccessMessage(form));
}
