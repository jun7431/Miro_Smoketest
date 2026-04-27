const {
  createSignupEvent,
  normalizeSignup,
} = require("./_lib/schema");
const { methodNotAllowed, readBody, sendError, sendJson } = require("./_lib/http");
const { getStorageInfo, storeEvent, storeSignup } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  try {
    const body = await readBody(req);
    const signup = normalizeSignup(body, req);
    const signupEvent = createSignupEvent(signup);

    await storeSignup(signup);
    await storeEvent(signupEvent);

    return sendJson(res, 201, {
      ok: true,
      signup,
      event: signupEvent,
      storage: getStorageInfo(),
      message: "Your early-access request has been recorded.",
    });
  } catch (error) {
    return sendError(
      res,
      error.statusCode || 400,
      error.message || "Unable to save signup."
    );
  }
};
