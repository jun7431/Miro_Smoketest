const crypto = require("node:crypto");

const EVENT_TYPE_ALIASES = {
  page_visit: "visit",
};

const VALID_EVENT_TYPES = new Set([
  "visit",
  "cta_click",
  "signup_submitted",
  "payment_click",
]);

const VALID_USE_CASES = new Set([
  "travel",
  "local_exploration",
  "date",
  "food",
  "other",
]);

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeString(value, maxLength = 255) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().slice(0, maxLength);
}

function normalizeNullableString(value, maxLength = 255) {
  const normalized = normalizeString(value, maxLength);
  return normalized || null;
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = normalizeString(value, 16).toLowerCase();
  return ["true", "1", "yes", "on", "checked"].includes(normalized);
}

function normalizeTimestamp(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeEventType(value) {
  const normalized = normalizeString(value, 80).toLowerCase();
  return EVENT_TYPE_ALIASES[normalized] || normalized;
}

function asObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function sanitizeMetadata(value) {
  const metadata = asObject(value);
  const cleaned = {};

  Object.entries(metadata).forEach(([key, entryValue]) => {
    const normalizedKey = normalizeString(key, 64);

    if (!normalizedKey || entryValue === undefined || entryValue === null) {
      return;
    }

    if (typeof entryValue === "boolean" || typeof entryValue === "number") {
      cleaned[normalizedKey] = entryValue;
      return;
    }

    const normalizedValue = normalizeString(entryValue, 1000);

    if (normalizedValue) {
      cleaned[normalizedKey] = normalizedValue;
    }
  });

  return cleaned;
}

function getMinimizedIpPrefix(value) {
  const forwardedFor = normalizeString(value, 255);
  const firstIp = forwardedFor.split(",")[0].trim();
  const ipv4Match = firstIp.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);

  if (ipv4Match) {
    return `${ipv4Match[1]}.${ipv4Match[2]}.${ipv4Match[3]}.0`;
  }

  return null;
}

function getRequestMeta(req) {
  return {
    referrer:
      normalizeNullableString(req.headers.referer || req.headers.referrer, 1000),
    user_agent: normalizeNullableString(req.headers["user-agent"], 1000),
    request_ip_prefix: getMinimizedIpPrefix(req.headers["x-forwarded-for"]),
  };
}

function normalizeEvent(payload, req) {
  const body = asObject(payload);
  const type = normalizeEventType(body.type);

  if (!VALID_EVENT_TYPES.has(type)) {
    throw new Error("Unsupported tracking event type.");
  }

  const requestMeta = getRequestMeta(req);
  const metadata = sanitizeMetadata(body.metadata);
  const label =
    normalizeString(body.label, 120) ||
    (type === "visit" ? "Visit" : type.replace(/_/g, " "));
  const normalizedName =
    normalizeString(body.normalized_name || body.normalizedName, 120) ||
    normalizeString(body.event_name || body.eventName, 120) ||
    label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") ||
    type;
  const referrer =
    normalizeNullableString(body.referrer, 1000) ||
    normalizeNullableString(metadata.referrer, 1000) ||
    requestMeta.referrer;
  const userAgent =
    normalizeNullableString(body.user_agent || body.userAgent, 1000) ||
    normalizeNullableString(metadata.user_agent, 1000) ||
    requestMeta.user_agent;
  const sessionId =
    normalizeNullableString(body.session_id || body.sessionId, 120) ||
    normalizeNullableString(metadata.session_id, 120);
  const anonymousId =
    normalizeNullableString(body.anonymous_id || body.anonymousId, 120) ||
    normalizeNullableString(metadata.anonymous_id, 120);

  if (requestMeta.request_ip_prefix && !metadata.request_ip_prefix) {
    metadata.request_ip_prefix = requestMeta.request_ip_prefix;
  }

  return {
    id: createId("evt"),
    type,
    timestamp: normalizeTimestamp(body.timestamp),
    page: normalizeString(body.page, 255) || "/",
    label,
    normalized_name: normalizedName,
    referrer,
    user_agent: userAgent,
    session_id: sessionId,
    anonymous_id: anonymousId,
    metadata,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeUseCase(value) {
  const normalized = normalizeString(value, 40).toLowerCase();

  if (!normalized) {
    return null;
  }

  return VALID_USE_CASES.has(normalized) ? normalized : "other";
}

function normalizeSignup(payload, req) {
  const body = asObject(payload);
  const email = normalizeString(body.email, 200).toLowerCase();
  const consent = normalizeBoolean(body.consent);

  if (!email || !isValidEmail(email)) {
    throw new Error("A valid email address is required.");
  }

  if (!consent) {
    throw new Error("Consent is required before submitting.");
  }

  const requestMeta = getRequestMeta(req);

  return {
    id: createId("signup"),
    timestamp: normalizeTimestamp(body.timestamp),
    name: normalizeNullableString(body.name, 120),
    email,
    phone: normalizeNullableString(body.phone, 80),
    language_or_nationality: normalizeNullableString(
      body.language_or_nationality,
      120
    ),
    use_case: normalizeUseCase(body.use_case),
    area: normalizeNullableString(body.area, 120),
    message: normalizeNullableString(body.message, 1200),
    consent,
    page: normalizeString(body.page, 255) || "/apply",
    referrer:
      normalizeNullableString(body.referrer, 1000) || requestMeta.referrer,
    source:
      normalizeNullableString(body.source, 120) ||
      normalizeNullableString(body.submission_source || body.source_page, 120) ||
      "early_access_form",
    anonymous_id:
      normalizeNullableString(body.anonymous_id, 120) ||
      normalizeNullableString(body.anonymousId, 120),
    session_id:
      normalizeNullableString(body.session_id, 120) ||
      normalizeNullableString(body.sessionId, 120),
    user_agent:
      normalizeNullableString(body.user_agent, 1000) ||
      requestMeta.user_agent,
  };
}

function createSignupEvent(signup) {
  return {
    id: createId("evt"),
    type: "signup_submitted",
    timestamp: signup.timestamp,
    page: signup.page,
    label: "Get early access",
    normalized_name: "free_early_access_signup",
    referrer: signup.referrer,
    user_agent: signup.user_agent,
    session_id: signup.session_id,
    anonymous_id: signup.anonymous_id,
    metadata: sanitizeMetadata({
      signup_id: signup.id,
      source: signup.source,
      use_case: signup.use_case,
      consent: signup.consent,
      email_domain: signup.email.split("@")[1] || null,
    }),
  };
}

module.exports = {
  createSignupEvent,
  normalizeEvent,
  normalizeSignup,
};
