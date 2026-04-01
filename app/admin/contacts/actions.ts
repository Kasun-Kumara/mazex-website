"use server";

import { AppwriteException } from "node-appwrite";
import { getCurrentAdmin } from "@/lib/admin-auth";
import {
  listRegistrationEmailContacts,
  MessagingContactsConfigError,
  sendRegistrationContactsEmail,
} from "@/lib/messaging-contacts";

export type AdminContactMailActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  toastKey: number;
};

const initialState: AdminContactMailActionState = {
  status: "idle",
  message: null,
  toastKey: 0,
};

function buildState(
  status: AdminContactMailActionState["status"],
  message: string | null,
): AdminContactMailActionState {
  return {
    status,
    message,
    toastKey: Date.now(),
  };
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readStringArrayJson(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item): item is string => Boolean(item));
  } catch {
    return [];
  }
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Your admin session has expired. Sign in again.");
  }

  return admin;
}

function handleError(error: unknown) {
  if (error instanceof AppwriteException) {
    if (error.code === 404) {
      return buildState(
        "error",
        "Email contacts are not set up in Appwrite yet. Run the Appwrite schema setup first.",
      );
    }

    if ([401, 403].includes(error.code ?? 0)) {
      return buildState(
        "error",
        "The Appwrite API key needs users.read, users.write, targets.read, targets.write, messages.write, topics.write, and subscribers.write scopes.",
      );
    }

    return buildState("error", error.message || "An Appwrite error occurred.");
  }

  if (error instanceof MessagingContactsConfigError) {
    return buildState("error", error.message);
  }

  return buildState(
    "error",
    error instanceof Error ? error.message : "Unable to send the email right now.",
  );
}

export async function sendContactEmailAction(
  _prev: AdminContactMailActionState = initialState,
  formData: FormData,
): Promise<AdminContactMailActionState> {
  void _prev;

  try {
    await requireAdmin();

    const recipientMode = readString(formData, "recipientMode") === "all" ? "all" : "selected";
    const subject = readString(formData, "subject");
    const content = readString(formData, "content");
    const selectedContactIds = readStringArrayJson(formData, "selectedContactIdsJson");
    const contacts = await listRegistrationEmailContacts();

    if (contacts.length === 0) {
      throw new Error("No synced contacts are available yet.");
    }

    if (recipientMode === "all") {
      await sendRegistrationContactsEmail({
        subject,
        content,
        sendToAll: true,
      });

      return buildState(
        "success",
        `Email queued for all ${contacts.length} synced contacts.`,
      );
    }

    const selectedContacts = contacts.filter((contact) =>
      selectedContactIds.includes(contact.id),
    );

    if (selectedContacts.length === 0) {
      throw new Error("Select at least one contact before sending.");
    }

    await sendRegistrationContactsEmail({
      subject,
      content,
      recipientTargetIds: selectedContacts.map((contact) => contact.targetId),
    });

    return buildState(
      "success",
      `Email queued for ${selectedContacts.length} selected contact${selectedContacts.length === 1 ? "" : "s"}.`,
    );
  } catch (error) {
    return handleError(error);
  }
}
