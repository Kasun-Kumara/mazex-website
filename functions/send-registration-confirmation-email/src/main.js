import { createHash } from "node:crypto";
import {
  Client,
  Databases,
  ID,
  Messaging,
  Query,
  Storage,
  Users,
} from "node-appwrite";

const DEFAULT_SUBMISSIONS_COLLECTION_ID = "registration_submissions";
const DEFAULT_REGISTRATION_FILES_BUCKET_ID = "registration_files";
const DEFAULT_CONTACTS_COLLECTION_ID = "registration_contacts";
const DEFAULT_CONTACTS_TOPIC_ID = "registration_contacts";
const DEFAULT_CONTACTS_TOPIC_NAME = "MazeX Registration Contacts";
const PRIMARY_EMAIL_TARGET_ID = "primary_email";
const CONTACT_ID_PREFIX = "contact_";
const CONTACT_SUBSCRIBER_PREFIX = "sub_";
const CONTACT_HASH_LENGTH = 28;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

function getHeader(req, key) {
  const headers = req?.headers ?? {};
  return (
    headers[key] ??
    headers[key.toLowerCase()] ??
    headers[key.toUpperCase()] ??
    ""
  );
}

function readPayload(req) {
  if (req?.bodyJson && typeof req.bodyJson === "object") {
    return req.bodyJson;
  }

  if (typeof req?.bodyText === "string" && req.bodyText.trim()) {
    try {
      return JSON.parse(req.bodyText);
    } catch {
      return null;
    }
  }

  return null;
}

function parseJson(value, fallback) {
  if (!value || typeof value !== "string") return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function trimNullable(value) {
  const normalized = trim(value);
  return normalized || null;
}

function normalizeEmailAddress(value) {
  return trim(value).toLowerCase();
}

function normalizeAnswerValue(value) {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function getRequiredEnv(key) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required function environment variable: ${key}`);
  }
  return value;
}

function createClient(req) {
  const key = String(getHeader(req, "x-appwrite-key") || "").trim();
  if (!key) {
    throw new Error("Missing x-appwrite-key header for Appwrite function execution.");
  }

  return new Client()
    .setEndpoint(getRequiredEnv("APPWRITE_FUNCTION_API_ENDPOINT"))
    .setProject(getRequiredEnv("APPWRITE_FUNCTION_PROJECT_ID"))
    .setKey(key);
}

function createDatabasesService(req) {
  return new Databases(createClient(req));
}

function createStorageService(req) {
  return new Storage(createClient(req));
}

function createUsersService(req) {
  return new Users(createClient(req));
}

function createMessagingService(req) {
  return new Messaging(createClient(req));
}

function getRegistrationFilesBucketId() {
  return (
    process.env.APPWRITE_BUCKET_REGISTRATION_FILES?.trim() ||
    DEFAULT_REGISTRATION_FILES_BUCKET_ID
  );
}

function getContactsCollectionId() {
  return (
    process.env.APPWRITE_COLLECTION_REGISTRATION_CONTACTS?.trim() ||
    DEFAULT_CONTACTS_COLLECTION_ID
  );
}

function getContactsTopicId() {
  return (
    process.env.APPWRITE_MESSAGING_CONTACTS_TOPIC_ID?.trim() ||
    DEFAULT_CONTACTS_TOPIC_ID
  );
}

function getEmailProviderId() {
  return process.env.APPWRITE_MESSAGING_EMAIL_PROVIDER_ID?.trim() || "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildScopedId(prefix, email) {
  const hash = createHash("sha256").update(email).digest("hex");
  return `${prefix}${hash.slice(0, CONTACT_HASH_LENGTH)}`;
}

function getContactDocumentId(email) {
  return buildScopedId(CONTACT_ID_PREFIX, email);
}

function getContactUserId(email) {
  return buildScopedId(CONTACT_ID_PREFIX, email);
}

function getContactSubscriberId(email) {
  return buildScopedId(CONTACT_SUBSCRIBER_PREFIX, email);
}

function getStoredFileId(value) {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized || "";
  }

  if (!value || typeof value !== "object") return "";

  for (const key of ["fileId", "$id", "id"]) {
    if (typeof value[key] === "string" && value[key].trim()) {
      return value[key].trim();
    }
  }

  return "";
}

function getStoredFileName(value) {
  if (!value || typeof value !== "object") return "";

  for (const key of ["fileName", "name", "originalName"]) {
    if (typeof value[key] === "string" && value[key].trim()) {
      return value[key].trim();
    }
  }

  return "";
}

async function resolveUploadedFileNames(req, fields, answers, memberAnswers, log) {
  const fileIds = new Set();
  const fileFields = fields.filter((field) => field.type === "file");

  const collectFileIds = (record) => {
    if (!record || typeof record !== "object") return;

    for (const field of fileFields) {
      const fileId = getStoredFileId(record[field.key]);
      if (fileId) fileIds.add(fileId);
    }
  };

  collectFileIds(answers);
  for (const member of memberAnswers) {
    collectFileIds(member);
  }

  if (fileIds.size === 0) {
    return new Map();
  }

  const storage = createStorageService(req);
  const bucketId = getRegistrationFilesBucketId();
  const entries = await Promise.all(
    [...fileIds].map(async (fileId) => {
      try {
        const file = await storage.getFile(bucketId, fileId);
        const fileName = typeof file?.name === "string" ? file.name.trim() : "";
        return fileName ? [fileId, fileName] : null;
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unknown Appwrite storage error.";
        log(`Unable to resolve uploaded file name for ${fileId}: ${message}`);
        return null;
      }
    }),
  );

  return new Map(entries.filter(Boolean));
}

function formatAnswerValueForEmail(field, value, fileNamesById) {
  if (field.type === "file") {
    const fileName = getStoredFileName(value);
    if (fileName) return fileName;

    const fileId = getStoredFileId(value);
    if (fileId) return fileNamesById.get(fileId) || fileId;

    return "-";
  }

  if (Array.isArray(value)) {
    const normalizedValues = value
      .map((item) => normalizeAnswerValue(item))
      .filter(Boolean);
    return normalizedValues.length > 0 ? normalizedValues.join(", ") : "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const normalized = normalizeAnswerValue(value);
  return normalized || "-";
}

function buildEmail(
  recipientName,
  formTitle,
  customTemplateText,
  fields,
  answers,
  memberAnswers,
  fileNamesById,
) {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hello,";
  const formLine = formTitle ? `Form: ${formTitle}` : null;

  const defaultText = [
    "Your MazeX registration was received successfully.",
    formLine,
    "Our team will contact you if any additional steps are required.",
  ]
    .filter(Boolean)
    .join("\n");

  const templateText = customTemplateText || defaultText;

  const inputsText = [];
  const inputsHtml = [];

  const submissionFields = fields.filter(
    (field) => field.scope === "submission" && field.type !== "page_break",
  );
  const memberFields = fields.filter(
    (field) => field.scope === "member" && field.type !== "page_break",
  );

  if (submissionFields.length > 0) {
    inputsText.push("--- Submission Details ---");
    inputsHtml.push(
      `<h3 style="margin-top: 32px; margin-bottom: 16px; color: #18181b; font-size: 18px; font-weight: 600; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">Submission Details</h3>`,
    );

    inputsHtml.push(`<table style="width: 100%; border-collapse: collapse;">`);
    for (const field of submissionFields) {
      const displayVal = formatAnswerValueForEmail(
        field,
        answers[field.key],
        fileNamesById,
      );
      inputsText.push(`${field.label}: ${displayVal}`);

      inputsHtml.push(`
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; width: 40%; color: #71717a; font-size: 14px; vertical-align: top;">${escapeHtml(field.label)}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f4f4f5; color: #18181b; font-size: 14px; font-weight: 500; vertical-align: top;">${escapeHtml(displayVal)}</td>
        </tr>
      `);
    }
    inputsHtml.push(`</table>`);
  }

  if (memberAnswers && memberAnswers.length > 0 && memberFields.length > 0) {
    inputsText.push("");
    inputsText.push("--- Team Members ---");

    inputsHtml.push(
      `<h3 style="margin-top: 32px; margin-bottom: 16px; color: #18181b; font-size: 18px; font-weight: 600; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">Team Members</h3>`,
    );

    memberAnswers.forEach((member, index) => {
      inputsText.push(`Member ${index + 1}:`);
      inputsHtml.push(
        `<div style="margin-bottom: 24px; background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 16px;">`,
      );
      inputsHtml.push(
        `<h4 style="margin: 0 0 12px 0; color: #52525b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Member ${index + 1}</h4>`,
      );
      inputsHtml.push(`<table style="width: 100%; border-collapse: collapse;">`);

      for (const field of memberFields) {
        const displayVal = formatAnswerValueForEmail(
          field,
          member[field.key],
          fileNamesById,
        );
        inputsText.push(`  ${field.label}: ${displayVal}`);

        inputsHtml.push(`
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; width: 40%; color: #71717a; font-size: 14px; vertical-align: top;">${escapeHtml(field.label)}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e4e4e7; color: #18181b; font-size: 14px; font-weight: 500; vertical-align: top;">${escapeHtml(displayVal)}</td>
          </tr>
        `);
      }
      inputsHtml.push(`</table></div>`);
    });
  }

  const templateHtml = customTemplateText
    ? customTemplateText
        .split("\n")
        .map(
          (line) =>
            `<p style="margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #3f3f46;">${escapeHtml(line)}</p>`,
        )
        .join("")
    : `<p style="margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #3f3f46;">Your MazeX registration was received successfully.</p>
       ${formLine ? `<p style="margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #3f3f46;"><strong>${escapeHtml(formLine)}</strong></p>` : ""}
       <p style="margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #3f3f46;">Our team will contact you if any additional steps are required.</p>`;

  const finalHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MazeX Registration</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background-color: #18181b; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">MazeX Registration</h1>
      </div>
      <div style="padding: 40px;">
        <p style="margin-top: 0; margin-bottom: 24px; font-size: 16px; color: #18181b; font-weight: 600;">${escapeHtml(greeting)}</p>

        <div style="margin-bottom: 32px;">
          ${templateHtml}
        </div>

        ${inputsHtml.join("")}

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e4e4e7;">
          <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
            Thank you,<br/>
            <strong>MazeX Team</strong>
          </p>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">This is an automated message from MazeX. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: formTitle
      ? `MazeX registration confirmed: ${formTitle}`
      : "MazeX registration confirmed",
    html: finalHtml,
    text: [
      greeting,
      "",
      templateText,
      "",
      ...inputsText,
      "",
      "Thank you,",
      "MazeX Team",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function lookupUserByEmail(req, email) {
  const result = await createUsersService(req).list({
    queries: [Query.equal("email", email), Query.limit(1)],
  });

  return result.users?.[0] ?? null;
}

async function ensureContactUser(req, params) {
  const normalizedEmail = normalizeEmailAddress(params.email);
  const users = createUsersService(req);
  const candidateUserIds = [...new Set([
    trim(params.existingUserId),
    getContactUserId(normalizedEmail),
  ].filter(Boolean))];

  let user = null;

  for (const userId of candidateUserIds) {
    try {
      user = await users.get({ userId });
      break;
    } catch (error) {
      if (!(error instanceof Error) || error.code !== 404) {
        throw error;
      }
    }
  }

  if (!user) {
    try {
      user = await users.create({
        userId: getContactUserId(normalizedEmail),
        email: normalizedEmail,
        name: params.name || undefined,
      });
    } catch (error) {
      if (!(error instanceof Error) || error.code !== 409) {
        throw error;
      }

      user = await lookupUserByEmail(req, normalizedEmail);
      if (!user) {
        throw error;
      }
    }
  }

  if (!user) {
    throw new Error(`Unable to create or find a messaging user for ${normalizedEmail}.`);
  }

  if (normalizeEmailAddress(user.email) !== normalizedEmail) {
    user = await users.updateEmail({
      userId: user.$id,
      email: normalizedEmail,
    });
  }

  if (params.name && trim(user.name) !== params.name) {
    user = await users.updateName({
      userId: user.$id,
      name: params.name,
    });
  }

  return user;
}

async function ensureContactTarget(req, params) {
  const normalizedEmail = normalizeEmailAddress(params.email);
  const providerId = getEmailProviderId();
  const users = createUsersService(req);
  const targets = await users.listTargets({
    userId: params.userId,
    queries: [Query.limit(100)],
  });
  const emailTargets = (targets.targets ?? []).filter(
    (target) => target.providerType === "email",
  );
  const fallbackTargetName = params.name || normalizedEmail;

  const existingTarget =
    emailTargets.find((target) => target.$id === trim(params.existingTargetId)) ||
    emailTargets.find(
      (target) => normalizeEmailAddress(target.identifier) === normalizedEmail,
    ) ||
    emailTargets[0] ||
    null;

  if (!existingTarget) {
    try {
      return await users.createTarget({
        userId: params.userId,
        targetId: trim(params.existingTargetId) || PRIMARY_EMAIL_TARGET_ID,
        providerType: "email",
        identifier: normalizedEmail,
        providerId: providerId || undefined,
        name: fallbackTargetName,
      });
    } catch (error) {
      if (!(error instanceof Error) || error.code !== 409) {
        throw error;
      }

      const refreshedTargets = await users.listTargets({
        userId: params.userId,
        queries: [Query.limit(100)],
      });
      const resolvedTarget = (refreshedTargets.targets ?? []).find(
        (target) => target.providerType === "email",
      );

      if (!resolvedTarget) {
        throw error;
      }

      return resolvedTarget;
    }
  }

  const needsIdentifierUpdate =
    normalizeEmailAddress(existingTarget.identifier) !== normalizedEmail;
  const needsNameUpdate = trim(existingTarget.name) !== fallbackTargetName;
  const needsProviderUpdate =
    Boolean(providerId) && trim(existingTarget.providerId) !== providerId;

  if (!needsIdentifierUpdate && !needsNameUpdate && !needsProviderUpdate) {
    return existingTarget;
  }

  return users.updateTarget({
    userId: params.userId,
    targetId: existingTarget.$id,
    identifier: normalizedEmail,
    providerId: providerId || undefined,
    name: fallbackTargetName,
  });
}

async function ensureContactsTopic(req) {
  const messaging = createMessagingService(req);
  const topicId = getContactsTopicId();

  try {
    await messaging.createTopic({
      topicId,
      name: DEFAULT_CONTACTS_TOPIC_NAME,
    });
  } catch (error) {
    if (!(error instanceof Error) || error.code !== 409) {
      throw error;
    }
  }

  return topicId;
}

async function ensureContactSubscription(req, email, targetId) {
  const messaging = createMessagingService(req);
  const topicId = await ensureContactsTopic(req);

  try {
    await messaging.createSubscriber({
      topicId,
      subscriberId: getContactSubscriberId(email),
      targetId,
    });
  } catch (error) {
    if (!(error instanceof Error) || error.code !== 409) {
      throw error;
    }
  }
}

async function getExistingContactDocument(req, email) {
  const databases = createDatabasesService(req);
  const databaseId = getRequiredEnv("APPWRITE_DB_ID");
  const collectionId = getContactsCollectionId();

  try {
    return await databases.getDocument(
      databaseId,
      collectionId,
      getContactDocumentId(email),
    );
  } catch (error) {
    if (!(error instanceof Error) || error.code !== 404) {
      throw error;
    }

    return null;
  }
}

async function upsertContactDocument(req, params) {
  const databases = createDatabasesService(req);
  const databaseId = getRequiredEnv("APPWRITE_DB_ID");
  const collectionId = getContactsCollectionId();
  const documentId = getContactDocumentId(params.email);
  const data = {
    email: params.email,
    name: params.name,
    userId: params.userId,
    targetId: params.targetId,
    lastFormId: params.lastFormId,
    lastFormTitle: params.lastFormTitle,
    lastSubmissionId: params.lastSubmissionId,
    lastSubmittedAt: params.lastSubmittedAt,
  };

  try {
    return await databases.updateDocument(databaseId, collectionId, documentId, data);
  } catch (error) {
    if (!(error instanceof Error) || error.code !== 404) {
      throw error;
    }
  }

  return databases.createDocument(databaseId, collectionId, documentId, data);
}

async function syncRegistrationContact(req, params) {
  const normalizedEmail = normalizeEmailAddress(params.email);
  const existingContact = await getExistingContactDocument(req, normalizedEmail);
  const user = await ensureContactUser(req, {
    email: normalizedEmail,
    name: params.name,
    existingUserId: trim(existingContact?.userId),
  });
  const target = await ensureContactTarget(req, {
    userId: user.$id,
    email: normalizedEmail,
    name: params.name,
    existingTargetId: trim(existingContact?.targetId),
  });

  await ensureContactSubscription(req, normalizedEmail, target.$id);
  await upsertContactDocument(req, {
    email: normalizedEmail,
    name: params.name || trimNullable(user.name),
    userId: user.$id,
    targetId: target.$id,
    lastFormId: params.lastFormId,
    lastFormTitle: params.lastFormTitle,
    lastSubmissionId: params.lastSubmissionId,
    lastSubmittedAt: params.lastSubmittedAt,
  });

  return {
    email: normalizedEmail,
    targetId: target.$id,
  };
}

async function sendRegistrationConfirmationEmail(context) {
  const { req, res, log, error } = context;

  const eventName = String(getHeader(req, "x-appwrite-event") || "");
  const expectedCollectionId =
    process.env.APPWRITE_COLLECTION_REGISTRATION_SUBMISSIONS?.trim() ||
    DEFAULT_SUBMISSIONS_COLLECTION_ID;

  if (
    eventName &&
    !eventName.includes(`.collections.${expectedCollectionId}.documents.`)
  ) {
    log(`Skipping unrelated event: ${eventName}`);
    return res.json({ ok: true, skipped: "unrelated_event" });
  }

  const payload = readPayload(req);
  if (!payload || typeof payload !== "object") {
    error("Registration confirmation function received an invalid payload.");
    return res.json({ ok: true, skipped: "invalid_payload" });
  }

  const formId = typeof payload.formId === "string" ? payload.formId.trim() : "";
  if (!formId) {
    error("Registration confirmation function received a submission without formId.");
    return res.json({ ok: true, skipped: "missing_form_id" });
  }

  const databases = createDatabasesService(req);
  const messaging = createMessagingService(req);
  const databaseId = getRequiredEnv("APPWRITE_DB_ID");
  const formsCollectionId = getRequiredEnv("APPWRITE_COLLECTION_REGISTRATION_FORMS");
  const fieldsCollectionId = getRequiredEnv("APPWRITE_COLLECTION_REGISTRATION_FIELDS");

  const [form, fieldsResult] = await Promise.all([
    databases.getDocument(databaseId, formsCollectionId, formId),
    databases.listDocuments(databaseId, fieldsCollectionId, [
      Query.equal("formId", formId),
      Query.limit(200),
    ]),
  ]);

  if (!form.confirmationEmailEnabled) {
    log(`Skipping confirmation email because it is disabled for form ${formId}.`);
    return res.json({ ok: true, skipped: "email_disabled" });
  }

  const emailField = fieldsResult.documents.find(
    (field) =>
      field.$id === form.confirmationEmailFieldId &&
      field.scope === "submission" &&
      field.type === "email",
  );
  const nameField = fieldsResult.documents.find(
    (field) =>
      field.$id === form.confirmationNameFieldId &&
      field.scope === "submission" &&
      field.type === "text",
  );

  if (!emailField || !nameField) {
    error(`Confirmation email settings are invalid for form ${formId}.`);
    return res.json({ ok: true, skipped: "invalid_form_settings" });
  }

  const parsedAnswers = parseJson(payload.answersJson, {});
  const answers =
    parsedAnswers && typeof parsedAnswers === "object" && !Array.isArray(parsedAnswers)
      ? parsedAnswers
      : {};
  const recipientEmail = normalizeEmailAddress(answers[emailField.key]);
  if (!recipientEmail) {
    log("Skipping confirmation email because the submission has no configured email value.");
    return res.json({ ok: true, skipped: "missing_recipient_email" });
  }

  if (!EMAIL_PATTERN.test(recipientEmail)) {
    log(`Skipping confirmation email because the address is invalid: ${recipientEmail}`);
    return res.json({ ok: true, skipped: "invalid_recipient_email" });
  }

  const recipientName = trimNullable(answers[nameField.key]);
  const formTitle = trim(form.title);
  const customTemplateText = trim(form.confirmationEmailTemplate);
  const parsedMemberAnswers = parseJson(payload.memberAnswersJson, []);
  const memberAnswers = Array.isArray(parsedMemberAnswers) ? parsedMemberAnswers : [];
  const sortedFields = [...fieldsResult.documents].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const fileNamesById = await resolveUploadedFileNames(
    req,
    sortedFields,
    answers,
    memberAnswers,
    log,
  );
  const contact = await syncRegistrationContact(req, {
    email: recipientEmail,
    name: recipientName,
    lastFormId: formId,
    lastFormTitle: formTitle || null,
    lastSubmissionId: trim(payload.$id),
    lastSubmittedAt: trim(payload.$createdAt),
  });
  const email = buildEmail(
    recipientName,
    formTitle,
    customTemplateText,
    sortedFields,
    answers,
    memberAnswers,
    fileNamesById,
  );

  try {
    await messaging.createEmail({
      messageId: ID.unique(),
      subject: email.subject,
      content: email.html,
      targets: [contact.targetId],
      html: true,
    });

    log(`Queued registration confirmation to ${contact.email}`);
    return res.json({ ok: true });
  } catch (sendError) {
    const message =
      sendError instanceof Error ? sendError.message : "Unknown Appwrite Messaging error.";
    error(`Failed to queue registration confirmation email: ${message}`);
    throw sendError;
  }
}

export default sendRegistrationConfirmationEmail;
