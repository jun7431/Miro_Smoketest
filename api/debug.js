const { getQuery, methodNotAllowed, sendError, sendJson } = require("./_lib/http");
const { getDebugSnapshot } = require("./_lib/storage");

function getProvidedToken(req) {
  const authHeader = typeof req.headers.authorization === "string" ? req.headers.authorization : "";

  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  return getQuery(req).get("token") || "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const configuredToken = (process.env.MIRO_ADMIN_TOKEN || "").trim();

  if (!configuredToken) {
    return sendError(res, 404, "Debug access is not enabled.");
  }

  if (getProvidedToken(req) !== configuredToken) {
    return sendError(res, 401, "Unauthorized.");
  }

  try {
    const query = getQuery(req);
    const limit = Number.parseInt(query.get("limit") || "25", 10);
    const kind = query.get("kind") || "all";
    const snapshot = await getDebugSnapshot(
      kind,
      Number.isNaN(limit) ? 25 : Math.min(limit, 100)
    );

    return sendJson(res, 200, {
      ok: true,
      kind,
      ...snapshot,
    });
  } catch (error) {
    return sendError(
      res,
      error.statusCode || 500,
      error.message || "Unable to load debug data."
    );
  }
};
