// Cloudflare Pages Function: /api/sync
// Requires a KV namespace bound as LOGS_KV in the Pages project settings.
//
// GET  /api/sync?code=XXXX      -> { logs: {...} }  (404 if code not found)
// POST /api/sync { code, logs } -> { ok: true }
//
// Data is stored under the KV key "code:<code>". Anyone who knows the
// sync code can read/write that data — treat it like a shared password,
// not a real login. Fine for a personal training log, not for anything
// sensitive.

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").trim();

  if (!code) {
    return jsonResponse({ error: "Missing code" }, 400);
  }

  const value = await env.LOGS_KV.get("code:" + code);
  if (!value) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  return jsonResponse({ logs: JSON.parse(value) });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const code = (body.code || "").trim();
  const logs = body.logs;

  if (!code) {
    return jsonResponse({ error: "Missing code" }, 400);
  }
  if (!logs || typeof logs !== "object") {
    return jsonResponse({ error: "Missing or invalid logs" }, 400);
  }
  if (code.length > 100) {
    return jsonResponse({ error: "Code too long" }, 400);
  }

  await env.LOGS_KV.put("code:" + code, JSON.stringify(logs));

  return jsonResponse({ ok: true });
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
