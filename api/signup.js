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
    let trackingEventStored = false;

    await storeSignup(signup);

    try {
      await storeEvent(signupEvent);
      trackingEventStored = true;
    } catch (eventError) {
      console.warn("[miro:signup] Signup saved but tracking event failed.", {
        message: eventError.message || "Unable to store tracking event.",
        statusCode: eventError.statusCode || null,
      });
    }

    return sendJson(res, 201, {
      ok: true,
      signup,
      event: signupEvent,
      tracking_event_stored: trackingEventStored,
      tracking_warning: trackingEventStored
        ? null
        : "Signup was saved, but the follow-up tracking event was not stored.",
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
