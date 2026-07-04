# BASECAMP — deploying with cross-device sync

This app now has an optional cloud sync layer using Cloudflare KV, so the
same training log can show up on your phone and laptop. It still works
fully offline without any setup — sync is opt-in.

## 1. Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo (or use `wrangler pages deploy .` directly
   from this folder if you have the Wrangler CLI installed).
2. In the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   connect your repo (or drag-and-drop this folder if deploying manually).
3. Build settings: none needed — no build command, output directory is `/`
   (this folder root, since `index.html` sits at the top level).

## 2. Create the KV namespace

1. Cloudflare dashboard → **Workers & Pages** → **KV** → **Create namespace**.
   Name it something like `basecamp-logs`.
2. Go to your Pages project → **Settings** → **Functions** → **KV namespace
   bindings** → **Add binding**:
   - Variable name: `LOGS_KV`
   - KV namespace: the one you just created
3. Redeploy (or it'll pick up on the next deploy) so the binding is live.

That's it — no database, no server to manage. `functions/api/sync.js` is a
Cloudflare Pages Function that runs automatically at `/api/sync`.

## 3. Using sync in the app

- Open the deployed URL, type any sync code you'll remember (e.g.
  `yash-basecamp-2026`) into the box under the stats bar, and tap **Connect**.
- Open the same URL on your other device, enter the **same code**, tap Connect.
  Both devices now read and write to the same KV record.
- Every save you make pushes to the cloud automatically once connected.
  If you're offline, it still saves locally and syncs next time you're online.
- Anyone who knows your code can read/write that data — it's a shared
  secret, not a real login. Fine for a personal log; don't reuse a
  password you care about as the code.

## 4. Local testing (optional)

If you want to test the Function locally before deploying:

```
npm install -g wrangler
wrangler pages dev . --kv LOGS_KV
```

This spins up a local dev server with an emulated KV namespace.
