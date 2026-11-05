# Automatic publication from the Admin editor

Cloudflare Pages serves the public `published-data.json`. The editor saves a local
copy immediately, then POSTs the full snapshot (additional players, reference-player
profiles, shirt names, citizenships, photo URLs, career, stats and match edits) to
`/api/admin/publish`. After a verified Cloudflare Access login, the server commits
that single file to `KHAN7-gif/sabah-fc`, branch `main`. The existing Cloudflare Git
integration then starts the site deployment. A GitHub commit is not proof that the
Cloudflare deployment has completed; check Pages > Deployments.

The browser never receives the GitHub credential. No automatic publication occurs
outside Admin mode. A failed publish retains local edits and shows an error.
`Terbit sekarang` retries after login/configuration. A stale revision or concurrent
write returns a conflict instead of overwriting another administrator's work. Export
the local copy before refreshing after a conflict. Reset Data Tempatan is local only.

## One-time Cloudflare setup (required before publication can work)

1. Keep the Pages Git integration connected to `KHAN7-gif/sabah-fc`, production
   branch `main`, root directory empty, build command empty, output directory `.`.
   The `functions/` directory builds automatically as Pages Functions.
2. In Cloudflare Zero Trust > Access > Applications, create a self-hosted application
   protecting the production hostname `sabah-fc.pages.dev` and path `/api/admin/*`.
   Allow only the administrator's email addresses using email OTP or your identity
   provider. Protect **both** `/api/admin/session` and `/api/admin/publish`.
   If the account cannot configure Access for the pages.dev hostname, attach a custom
   domain and configure this application for that domain instead, then use that
   domain for the editor. Do not broaden the policy to everyone or use a bypass.
3. Copy the application's Audience (AUD) tag and your Zero Trust team domain
   (such as `your-team.cloudflareaccess.com`, without `https://`).
4. Create a GitHub fine-grained personal access token, restricted to this repository,
   with **Contents: Read and write**. No workflow, account or organization permissions
   are required. Review any repository rules that prevent commits to `main`.
5. In the **Cloudflare Pages project**, Settings > Variables and Secrets, add these
   production bindings (not in chat, GitHub files or frontend JavaScript):

   | Name | Kind | Value |
   | --- | --- | --- |
   | `GITHUB_PUBLISH_TOKEN` | Secret | The fine-grained GitHub token |
   | `CF_ACCESS_TEAM_DOMAIN` | Variable | Your team domain, without scheme or slash |
   | `CF_ACCESS_AUD` | Variable | The Access application's AUD tag |
   | `ADMIN_EMAILS` | Variable | Comma-separated exact administrator email addresses |

   These bindings belong to the deployed Pages Functions runtime. Adding them only
   to the Codex development environment does not activate this feature. Do not add
   credentials to GitHub Pages: it cannot execute this backend. Preview deployments
   need separate matching Access/application configuration; otherwise publication
   intentionally fails closed there.
6. Redeploy the latest GitHub commit so the Functions receive the new bindings.
7. On the Cloudflare-hosted site, enable Admin mode, select **Log masuk penerbitan**,
   complete Access login, then return and select **Terbit sekarang**. Confirm that
   the status includes a GitHub commit and that Pages deploys it successfully.
8. Make one small player edit. Confirm it creates another commit, then open the
   deployed site in a fresh browser context to verify the public data. Never claim
   the feature is live until these real checks succeed.

`published-data.json` must remain public: it contains only public portal information,
never credentials, private personal data or administrator email addresses. Its
`revision` is the conflict token, not an authentication token. GitHub Pages also
loads it after the normal GitHub Pages deployment, but the Admin publisher works
only on the Cloudflare hostname with its Functions and Access configuration.

## Validation

- `node tests/publish.test.mjs`: real signed test JWTs, authentication rejection,
  origin checks, payload bounds, stale/concurrent edits, SHA-based commits, public
  data preservation, unchanged snapshots and sanitized failures, with mocked remote
  APIs. This does not validate real Cloudflare/GitHub credentials.
- `node --check app.js`.
- `wrangler pages functions build functions --outdir /tmp/sabah-functions-build`.

Player photos stored as files in `assets/players/` still require a file upload/commit.
The automatic editor publishes metadata and photo **URLs**, not binary photo uploads.
