# Miro MVP Demo + Tracking

This project keeps Miro as the main smoke-test shell, keeps the existing Vercel API routes and Supabase persistence, and selectively borrows the smallest useful demo layer from `Niro_Local`: a fast area/time/vibe input flow plus an immediate 3-pick sample result on the homepage.

## What is tracked

The deployed site records four funnel stages:

- `visit`
  - fired automatically when a page loads
- `cta_click`
  - fired when a tracked `data-cta` link or button is clicked
  - used for demo and signup funnel milestones through `normalized_name`
- `signup_submitted`
  - fired after the early-access form is saved successfully
- `payment_click`
  - fired when a payment-related CTA is clicked

Key `normalized_name` values now include:

- `homepage_visit`
- `demo_started`
- `demo_input_area_selected`
- `demo_input_time_selected`
- `demo_input_vibe_selected`
- `demo_submitted`
- `demo_result_viewed`
- `signup_started`
- `signup_submitted`
- `optional_details_provided`
- `stronger_intent_cta_clicked`
- `payment_cta_clicked` when a real Stripe link is active

## Where it is stored

The browser and admin checks use these Vercel routes:

- `POST /api/track`
- `POST /api/signup`
- `GET /api/supabase-health`
- `GET /api/debug?token=...`

The backend writes into Supabase using the server-side service role key.

Logical tables:

- `tracking_events`
  - `id`
  - `type`
  - `timestamp`
  - `page`
  - `label`
  - `normalized_name`
  - `referrer`
  - `user_agent`
  - `session_id`
  - `anonymous_id`
  - `metadata`
- `signup_submissions`
  - `id`
  - `timestamp`
  - `page`
  - `name`
  - `email`
  - `phone`
  - `language_or_nationality`
  - `use_case`
  - `area`
  - `message`
  - `consent`
  - `source`
  - `referrer`
  - `user_agent`
  - `session_id`
  - `anonymous_id`

The SQL for these tables lives in `supabase/schema.sql`.

## What came from Niro_Local vs Miro

Imported from `Niro_Local`:

- the fast 3-input demo pattern
- the lightweight selection-preview feel
- the immediate 3-pick / mini-route result framing

Kept from `Miro_Smoketest`:

- Miro branding and page structure
- Vercel-friendly static + API layout
- tracking endpoints
- signup capture flow
- Supabase persistence and debug inspection
- secondary stronger-intent / payment path

## Vercel environment variables

Add these in Vercel Project Settings:

- `MIRO_STORAGE_DRIVER=supabase`
- `SUPABASE_URL=https://YOUR_PROJECT.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_OR_SERVICE_ROLE_KEY`
- `MIRO_ADMIN_TOKEN=YOUR_SECRET_DEBUG_TOKEN`

Optional overrides:

- `MIRO_SUPABASE_SCHEMA=public`
- `MIRO_SUPABASE_EVENTS_TABLE=tracking_events`
- `MIRO_SUPABASE_SIGNUPS_TABLE=signup_submissions`

Important:

- The deployed project should use `supabase` mode
- If Supabase is not configured, the API routes now fail loudly instead of silently pretending the data was saved
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Never commit a real `.env` file
- Use Vercel Environment Variables for production

## Supabase setup

1. Create a Supabase project.
2. In Supabase, copy the Project URL from Project Settings.
3. In Supabase, copy the Secret key / service role key from Project Settings. Keep this server-side only.
4. In Vercel Project Settings, add:
   - `MIRO_STORAGE_DRIVER=supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MIRO_SUPABASE_SCHEMA=public`
   - `MIRO_SUPABASE_EVENTS_TABLE=tracking_events`
   - `MIRO_SUPABASE_SIGNUPS_TABLE=signup_submissions`
   - `MIRO_ADMIN_TOKEN`
5. Open the Supabase SQL Editor.
6. Run the SQL from `supabase/schema.sql`.
7. Redeploy the Vercel project so the new environment variables are active.
8. Open `/api/supabase-health` on the deployed domain. A healthy setup returns `ok: true` and both tables marked as reachable.
9. Submit one test signup with safe test data such as `test+miro-123@example.com`, then confirm a row appears in Supabase Table Editor under `signup_submissions`.

The SQL enables Row Level Security on both tables and intentionally does not create broad public `SELECT` or anon `INSERT` policies. Browser users submit through Vercel API routes, and the serverless functions write to Supabase with the server-side service role key.

If `/api/supabase-health` reports `Missing table: tracking_events` or `Missing table: signup_submissions`, run `supabase/schema.sql` again in the Supabase SQL Editor and redeploy if environment variables changed.

## How to inspect data later

You have two simple inspection options:

1. Supabase dashboard
   - open `tracking_events`
   - open `signup_submissions`
2. Protected debug endpoint
   - all records: `/api/debug?token=YOUR_TOKEN`
   - events only: `/api/debug?token=YOUR_TOKEN&kind=events`
   - signups only: `/api/debug?token=YOUR_TOKEN&kind=signups`
   - optional limit: `&limit=50`

For quick setup validation, use `/api/supabase-health`. It reports whether Supabase env vars are present and whether the configured tables are reachable, but it does not expose secrets or stored user data.

## Stripe payment link

The payment CTA is still a placeholder by design. Replace `https://buy.stripe.com/YOUR_PAYMENT_LINK` in these files when you have the real Stripe Payment Link:

- `index.html`
- `apply.html`
- `thank-you.html`

## Phase 1 SEO/GEO foundation

This static Vercel project now includes a conservative crawl foundation:

- `robots.txt`
  - allows public pages for crawlers
  - disallows non-page API/internal paths
  - references the sitemap
- `sitemap.xml`
  - includes the current canonical public pages, including `/`, `/about`, `/how-it-works`, `/faq`, `/trust`, `/compare/`, `/reports/`, and `/apply.html`
  - excludes `thank-you.html` because it is a post-conversion page with `noindex,follow`
- HTML metadata
  - key public pages include unique titles, meta descriptions, canonical URLs, Open Graph basics, and Twitter summary card metadata
- JSON-LD
  - homepage includes minimal `Organization`, `WebSite`, and `WebApplication` structured data
  - FAQ page includes `FAQPage` structured data matching the visible FAQ content

Production domain:

- `https://miro-smoketest.vercel.app` is used as the production domain in canonical URLs, Open Graph URLs, JSON-LD, `robots.txt`, `sitemap.xml`, content sources, and page generators

Manual follow-ups:

1. Submit `/sitemap.xml` in Google Search Console after deployment is confirmed.
2. Optionally validate `robots.txt`, the sitemap, and structured data with external search testing tools.
3. Re-run the static generators after future content changes so generated pages keep the same domain and metadata conventions.

## Phase 2 answer-oriented GEO layer

The site now includes an answerability layer intended to help search engines and AI answer engines understand Miro without inventing claims:

- Clear product explanation
  - the homepage, About page, How It Works page, FAQ, Trust page, comparison pages, and reports index describe Miro as an early-access Korea local travel recommendation product for international travelers
  - copy focuses on area, time, mood, local signals, and context-aware recommendations rather than unsupported performance claims
- Question-and-answer structure
  - `faq.html` presents core product and trust questions in visible Q&A format
  - the FAQ content is paired with `FAQPage` JSON-LD so crawlers can connect the structured data to the visible answers
- Internal answer paths
  - homepage navigation and footer links connect users and crawlers to About, How It Works, FAQ, Trust, Compare, Reports, and Apply
  - comparison and reports pages link back into the main product and trust surfaces instead of standing alone
- Claim discipline
  - the content intentionally avoids fake reviews, fake rankings, invented partnerships, unsupported user counts, and unverified research claims
  - draft report pages remain `noindex,follow` until real source data, methodology, and limitations are documented

## Phase 3 trust and comparison layer

The site now includes a lightweight trust/comparison layer using the same static HTML conventions:

- Trust pages:
  - `/about`
  - `/how-it-works`
  - `/faq`
  - `/trust`
- Comparison pages:
  - `/compare/`
  - `/compare/miro-vs-klook`
  - `/compare/miro-vs-tripadvisor`
  - `/compare/miro-vs-google-maps-and-reddit`
  - `/compare/miro-vs-ai-travel-planners`

Implementation notes:

- `vercel.json` enables clean URLs so existing files like `about.html` resolve at `/about`
- comparison pages are static directory routes under `compare/<slug>/index.html`
- `tools/generate-phase3-pages.py` is the source template/content generator for trust and comparison pages
- comparison copy is intentionally fair and does not claim fake rankings, reviews, partnerships, or usage proof
- the sitemap includes the trust and comparison URLs

## Phase 4 reports infrastructure

The site now includes a truthful reports publishing framework:

- `/reports/`
  - public reports index
  - indexable and included in `sitemap.xml`
- `/reports/neighborhood-local-signal-patterns-template`
  - non-indexed draft/template report page
- `/reports/visitor-friction-themes-template`
  - non-indexed draft/template report page

Implementation notes:

- `content/reports.json` is the structured report content source
- `tools/generate-reports.py` generates the reports index and report detail pages
- no real local-place, saved-list, survey, interview, or analytics dataset was found in this repository
- draft report pages use `noindex,follow` and clearly state that no findings are published
- draft report detail pages are intentionally excluded from `sitemap.xml`; only `/reports/` is included

To publish a real report later:

1. Add a real, documented source dataset or export to the repository or configure a trusted source.
2. Update `content/reports.json` with the source type, scope, methodology, limitations, and conservative findings.
3. Set the report `indexable` value to `true` only after the claims are source-backed.
4. Regenerate pages with `python tools/generate-reports.py`.
5. Add the published report URL to `sitemap.xml`.
