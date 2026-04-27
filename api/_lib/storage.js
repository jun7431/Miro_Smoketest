const {
  createStorageConfigurationError,
  getSupabaseConfig,
  insertEventRecord,
  insertSignupRecord,
  isSupabaseConfigured,
  listRecentEventRecords,
  listRecentSignupRecords,
} = require("./supabase");

const VALID_STORAGE_DRIVERS = new Set(["supabase", "console"]);

function getStorageDriver() {
  const configuredDriver = (process.env.MIRO_STORAGE_DRIVER || "").trim().toLowerCase();

  if (VALID_STORAGE_DRIVERS.has(configuredDriver)) {
    return configuredDriver;
  }

  if (isSupabaseConfigured()) {
    return "supabase";
  }

  return "unconfigured";
}

function getStorageInfo() {
  const driver = getStorageDriver();

  if (driver === "supabase") {
    const config = getSupabaseConfig();

    return {
      driver,
      persistent: true,
      schema: config.schema,
      tables: {
        events: config.eventsTable,
        signups: config.signupsTable,
      },
      note: "Tracking events and signup submissions are stored in Supabase.",
    };
  }

  if (driver === "console") {
    return {
      driver,
      persistent: false,
      note: "Console mode is for local debugging only and is not durable.",
    };
  }

  return {
    driver: "unconfigured",
    persistent: false,
    note: "Persistent storage is not configured. Set MIRO_STORAGE_DRIVER=supabase plus SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  };
}

function assertPersistentStorage() {
  const driver = getStorageDriver();

  if (driver === "supabase") {
    return driver;
  }

  if (driver === "console" && !process.env.VERCEL) {
    return driver;
  }

  throw createStorageConfigurationError(
    "Persistent storage is not configured for this deployment. Configure Supabase before accepting traffic."
  );
}

async function storeEvent(event) {
  const driver = assertPersistentStorage();

  if (driver === "console") {
    console.log(`[miro:events] ${JSON.stringify(event)}`);
    return event;
  }

  return insertEventRecord(event);
}

async function storeSignup(signup) {
  const driver = assertPersistentStorage();

  if (driver === "console") {
    console.log(`[miro:signups] ${JSON.stringify(signup)}`);
    return signup;
  }

  return insertSignupRecord(signup);
}

async function getDebugSnapshot(kind = "all", limit = 25) {
  const storage = getStorageInfo();

  if (storage.driver !== "supabase") {
    return {
      storage,
      events: [],
      signups: [],
      note: storage.note,
    };
  }

  const normalizedKind = typeof kind === "string" ? kind.trim().toLowerCase() : "all";
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 25;

  if (!["all", "events", "signups"].includes(normalizedKind)) {
    const error = new Error("Invalid debug kind. Use all, events, or signups.");
    error.statusCode = 400;
    throw error;
  }

  const includeEvents = normalizedKind === "all" || normalizedKind === "events";
  const includeSignups = normalizedKind === "all" || normalizedKind === "signups";

  return {
    storage,
    events: includeEvents ? await listRecentEventRecords(safeLimit) : [],
    signups: includeSignups ? await listRecentSignupRecords(safeLimit) : [],
    note: "Use ?kind=events or ?kind=signups to scope the response.",
  };
}

module.exports = {
  getDebugSnapshot,
  getStorageDriver,
  getStorageInfo,
  storeEvent,
  storeSignup,
};
