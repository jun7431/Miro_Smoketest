const { URL } = require("node:url");

function normalizeUrl(value) {
  return typeof value === "string" ? value.trim().replace(/\/+$/, "") : "";
}

function getSupabaseConfig() {
  return {
    url: normalizeUrl(process.env.SUPABASE_URL),
    serviceRoleKey:
      typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string"
        ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
        : "",
    schema:
      typeof process.env.MIRO_SUPABASE_SCHEMA === "string" &&
      process.env.MIRO_SUPABASE_SCHEMA.trim()
        ? process.env.MIRO_SUPABASE_SCHEMA.trim()
        : "public",
    eventsTable:
      typeof process.env.MIRO_SUPABASE_EVENTS_TABLE === "string" &&
      process.env.MIRO_SUPABASE_EVENTS_TABLE.trim()
        ? process.env.MIRO_SUPABASE_EVENTS_TABLE.trim()
        : "tracking_events",
    signupsTable:
      typeof process.env.MIRO_SUPABASE_SIGNUPS_TABLE === "string" &&
      process.env.MIRO_SUPABASE_SIGNUPS_TABLE.trim()
        ? process.env.MIRO_SUPABASE_SIGNUPS_TABLE.trim()
        : "signup_submissions",
  };
}

function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.serviceRoleKey);
}

function createStorageConfigurationError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
}

const REQUIRED_EVENT_COLUMNS = [
  "id",
  "type",
  "timestamp",
  "page",
  "label",
  "normalized_name",
  "referrer",
  "user_agent",
  "session_id",
  "anonymous_id",
  "metadata",
];

const REQUIRED_SIGNUP_COLUMNS = [
  "id",
  "timestamp",
  "page",
  "name",
  "email",
  "phone",
  "language_or_nationality",
  "use_case",
  "area",
  "message",
  "consent",
  "source",
  "referrer",
  "user_agent",
  "session_id",
  "anonymous_id",
];

function looksLikeMissingTableError(detail, responseStatus) {
  const text = typeof detail === "string" ? detail.toLowerCase() : "";

  return (
    responseStatus === 404 ||
    text.includes("could not find the table") ||
    (text.includes("schema cache") && text.includes("table")) ||
    (text.includes("relation") && text.includes("does not exist"))
  );
}

function assertSupabaseConfigured() {
  if (isSupabaseConfigured()) {
    return getSupabaseConfig();
  }

  throw createStorageConfigurationError(
    "Supabase storage is not configured. Set MIRO_STORAGE_DRIVER=supabase plus SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel."
  );
}

function createHeaders(config, additionalHeaders = {}) {
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...additionalHeaders,
  };

  if (config.schema && config.schema !== "public") {
    headers["Accept-Profile"] = config.schema;
    headers["Content-Profile"] = config.schema;
  }

  return headers;
}

async function parseResponse(response, fallbackMessage, options = {}) {
  const bodyText = await response.text();
  let parsedBody = null;

  if (bodyText) {
    try {
      parsedBody = JSON.parse(bodyText);
    } catch (error) {
      parsedBody = bodyText;
    }
  }

  if (!response.ok) {
    const detail =
      parsedBody && typeof parsedBody === "object"
        ? parsedBody.message || parsedBody.error || parsedBody.details || null
        : parsedBody;
    const tableName = options.tableName || "";
    const errorMessage =
      tableName && looksLikeMissingTableError(detail, response.status)
        ? `Missing table: ${tableName}. Run supabase/schema.sql in the Supabase SQL Editor.`
        : detail || fallbackMessage || "Supabase request failed.";
    const error = createStorageConfigurationError(errorMessage);
    error.isMissingTable =
      Boolean(tableName) && looksLikeMissingTableError(detail, response.status);
    error.responseStatus = response.status;
    error.supabaseDetail =
      typeof detail === "string" && detail !== errorMessage ? detail : null;
    throw error;
  }

  return parsedBody;
}

function getSafeErrorMessage(error) {
  return error && error.message ? error.message : "Supabase request failed.";
}

function createTableHealth(
  tableName,
  role,
  { exists, readAccessible, insertAccessible, message }
) {
  return {
    table: tableName,
    role,
    exists,
    readAccessible,
    insertAccessible,
    message:
      message ||
      (exists && readAccessible && insertAccessible
        ? "Table and required columns are reachable with the configured server-side key."
        : `Missing table: ${tableName}. Run supabase/schema.sql in the Supabase SQL Editor.`),
  };
}

async function checkTableReachable(tableName, role, requiredColumns) {
  try {
    await selectFromTable(tableName, {
      select: requiredColumns.join(","),
      limit: 1,
      orderBy: "timestamp",
    });

    return createTableHealth(tableName, role, {
      exists: true,
      readAccessible: true,
      insertAccessible: true,
    });
  } catch (error) {
    const missingTable = Boolean(error && error.isMissingTable);

    return createTableHealth(tableName, role, {
      exists: !missingTable,
      readAccessible: false,
      insertAccessible: false,
      message: getSafeErrorMessage(error),
    });
  }
}

function buildRestUrl(config, tableName, query = {}) {
  const url = new URL(`${config.url}/rest/v1/${tableName}`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function insertIntoTable(tableName, record) {
  const config = assertSupabaseConfigured();
  const response = await fetch(buildRestUrl(config, tableName), {
    method: "POST",
    headers: createHeaders(config, {
      Prefer: "return=representation",
    }),
    body: JSON.stringify(record),
  });

  const rows = await parseResponse(response, `Unable to insert row into ${tableName}.`, {
    tableName,
  });
  return Array.isArray(rows) ? rows[0] || null : rows;
}

async function selectFromTable(tableName, options = {}) {
  const config = assertSupabaseConfigured();
  const query = {
    select: options.select || "*",
    limit: options.limit || 25,
    order: `${options.orderBy || "timestamp"}.${options.ascending ? "asc" : "desc"}`,
  };

  if (options.type) {
    query.type = `eq.${options.type}`;
  }

  const response = await fetch(buildRestUrl(config, tableName, query), {
    method: "GET",
    headers: createHeaders(config),
  });

  const rows = await parseResponse(response, `Unable to read rows from ${tableName}.`, {
    tableName,
  });
  return Array.isArray(rows) ? rows : [];
}

async function insertEventRecord(record) {
  const config = assertSupabaseConfigured();
  return insertIntoTable(config.eventsTable, record);
}

async function insertSignupRecord(record) {
  const config = assertSupabaseConfigured();
  return insertIntoTable(config.signupsTable, record);
}

async function listRecentEventRecords(limit) {
  const config = assertSupabaseConfigured();
  return selectFromTable(config.eventsTable, { limit });
}

async function listRecentSignupRecords(limit) {
  const config = assertSupabaseConfigured();
  return selectFromTable(config.signupsTable, { limit });
}

async function checkSupabaseHealth(storageDriver) {
  const config = getSupabaseConfig();
  const supabaseConfigured = isSupabaseConfigured();
  const configuredStorageDriver =
    typeof storageDriver === "string" && storageDriver ? storageDriver : "unknown";

  if (!supabaseConfigured) {
    return {
      ok: false,
      storageDriver: configuredStorageDriver,
      supabaseConfigured,
      schema: config.schema,
      tables: {
        [config.eventsTable]: createTableHealth(
          config.eventsTable,
          "events",
          {
            exists: false,
            readAccessible: false,
            insertAccessible: false,
            message:
              "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
          }
        ),
        [config.signupsTable]: createTableHealth(
          config.signupsTable,
          "signups",
          {
            exists: false,
            readAccessible: false,
            insertAccessible: false,
            message:
              "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
          }
        ),
      },
      messages: [
        "Set MIRO_STORAGE_DRIVER=supabase plus SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      ],
    };
  }

  const [eventsHealth, signupsHealth] = await Promise.all([
    checkTableReachable(config.eventsTable, "events", REQUIRED_EVENT_COLUMNS),
    checkTableReachable(config.signupsTable, "signups", REQUIRED_SIGNUP_COLUMNS),
  ]);
  const ok =
    configuredStorageDriver === "supabase" &&
    eventsHealth.insertAccessible &&
    signupsHealth.insertAccessible;
  const messages = [];

  if (configuredStorageDriver !== "supabase") {
    messages.push("MIRO_STORAGE_DRIVER should be set to supabase for production.");
  }

  [eventsHealth, signupsHealth].forEach((tableHealth) => {
    if (!tableHealth.insertAccessible) {
      messages.push(tableHealth.message);
    }
  });

  return {
    ok,
    storageDriver: configuredStorageDriver,
    supabaseConfigured,
    schema: config.schema,
    tables: {
      [config.eventsTable]: eventsHealth,
      [config.signupsTable]: signupsHealth,
    },
    messages,
  };
}

module.exports = {
  assertSupabaseConfigured,
  checkSupabaseHealth,
  createStorageConfigurationError,
  getSupabaseConfig,
  insertEventRecord,
  insertSignupRecord,
  isSupabaseConfigured,
  listRecentEventRecords,
  listRecentSignupRecords,
};
