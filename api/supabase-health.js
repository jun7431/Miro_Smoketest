const { methodNotAllowed, sendJson } = require("./_lib/http");
const { checkSupabaseHealth } = require("./_lib/supabase");
const { getStorageDriver } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const health = await checkSupabaseHealth(getStorageDriver());
  return sendJson(res, health.ok ? 200 : 503, health);
};
