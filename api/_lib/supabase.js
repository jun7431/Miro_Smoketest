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

async function parseResponse(response, fallbackMessage) {
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
    const error = createStorageConfigurationError(
      detail || fallbackMessage || "Supabase request failed."
    );
    error.responseStatus = response.status;
    throw error;
  }

  return parsedBody;
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

  const rows = await parseResponse(response, `Unable to insert row into ${tableName}.`);
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

  const rows = await parseResponse(response, `Unable to read rows from ${tableName}.`);
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

module.exports = {
  assertSupabaseConfigured,
  createStorageConfigurationError,
  getSupabaseConfig,
  insertEventRecord,
  insertSignupRecord,
  isSupabaseConfigured,
  listRecentEventRecords,
  listRecentSignupRecords,
};
