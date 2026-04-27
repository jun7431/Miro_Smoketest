const { normalizeEvent } = require("./_lib/schema");
const { methodNotAllowed, readBody, sendError, sendJson } = require("./_lib/http");
const { getStorageInfo, storeEvent } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readBody(req);
    const event = normalizeEvent(body, req);

    await storeEvent(event);

    return sendJson(res, 201, {
      ok: true,
      event,
      storage: getStorageInfo(),
    });
  } catch (error) {
    return sendError(
      res,
      error.statusCode || 400,
      error.message || "Unable to store tracking event."
    );
  }
};
