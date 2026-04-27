const { URL } = require("node:url");

function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
}

function sendJson(res, statusCode, payload) {
  setNoStore(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

function sendError(res, statusCode, message, details) {
  const payload = { ok: false, error: message };

  if (details) {
    payload.details = details;
  }

  sendJson(res, statusCode, payload);
}

function methodNotAllowed(res, allowedMethods) {
  res.setHeader("Allow", allowedMethods.join(", "));
  sendError(res, 405, "Method not allowed.");
}

function parseContentTypeValue(rawValue) {
  return typeof rawValue === "string" ? rawValue.split(";")[0].trim().toLowerCase() : "";
}

function parseRawBody(rawBody, contentType) {
  if (!rawBody) {
    return {};
  }

  if (contentType === "application/json") {
    return JSON.parse(rawBody);
  }

  if (contentType === "application/x-www-form-urlencoded") {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return {};
  }
}

async function readBody(req) {
  const contentType = parseContentTypeValue(req.headers["content-type"]);

  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "string") {
      return parseRawBody(req.body, contentType);
    }

    return req.body;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return parseRawBody(rawBody, contentType);
}

function getQuery(req) {
  const requestUrl = new URL(req.url || "/", "http://localhost");
  return requestUrl.searchParams;
}

module.exports = {
  getQuery,
  methodNotAllowed,
  readBody,
  sendError,
  sendJson,
  setNoStore,
};
