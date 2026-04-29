# AGENTS.md

## Project context

This is the Miro web MVP project. The main goal is to validate user demand for a Seoul travel recommendation product through clear positioning, SEO/GEO discovery, trust-building pages, CTA flows, signup collection, and basic tracking.

Prioritize production reliability, user-facing credibility, and deployability on Vercel.

## Core project rules

- Preserve existing functionality unless explicitly instructed otherwise.
- Keep changes small, focused, and reviewable.
- Use the existing tech stack, file structure, naming style, and coding conventions.
- Do not rewrite large parts of the project unless necessary.
- Do not remove working pages, CTAs, forms, tracking logic, SEO content, or navigation links unless explicitly requested.
- Do not simplify the product in a way that weakens the MVP’s purpose: validating demand and collecting user intent.

## UI and content rules

- Preserve the current product positioning unless explicitly asked to change it.
- When improving UI, do not reduce functionality.
- Keep the site user-friendly, credible, and conversion-oriented.
- Maintain clear CTAs such as prototype usage, signup, apply, waitlist, or contact flows.
- Avoid making the site feel like a generic template.
- Keep copy concise, trustworthy, and useful for first-time Seoul travelers.

## SEO/GEO rules

- Preserve existing SEO/GEO pages, guide pages, comparison pages, trust pages, reports, and internal links unless explicitly instructed otherwise.
- When adding new pages, include:
  - Unique URL
  - Clear H1
  - Intro section
  - Useful body content
  - FAQ section where appropriate
  - CTA
  - Internal links to relevant pages
- Avoid duplicate titles, duplicate meta descriptions, broken internal links, and orphan pages.
- When changing routing or URLs, check for broken links.

## Data collection and API rules

- Do not hardcode secrets, API keys, Supabase service role keys, tokens, or private credentials.
- Keep sensitive credentials server-side only.
- Never expose Supabase service role keys in client-side HTML, JavaScript, or public assets.
- Use environment variables for deployment-specific values.
- When modifying signup, tracking, forms, API routes, database schemas, or storage logic, verify the full user flow:
  - Page loads correctly
  - Form submits correctly
  - API route responds correctly
  - Data is stored correctly or errors are handled clearly
  - User-facing success/error states work

## Vercel deployment rules

- Keep the project compatible with GitHub + Vercel deployment.
- Do not introduce server requirements that Vercel cannot run without explaining them first.
- Do not modify production environment values directly.
- If a new environment variable is required, clearly document:
  - Variable name
  - Where it is used
  - Whether it is server-side or client-side
  - Example value format, without real secrets

## Testing and verification

Before finishing, inspect available project scripts and run the relevant checks when available:

- npm run build
- npm run lint
- npm test, if available

If no automated checks exist, perform a lightweight smoke check instead:

- Check that key pages load
- Check navigation links
- Check CTA buttons
- Check signup or form submission flow if touched
- Check API routes if touched
- Check browser console/runtime errors where practical

Do not claim that a test, build, deployment, or API verification succeeded unless it was actually run.

## Git and reporting

At the end of each task, summarize:

- What changed
- Which files changed
- What checks were run
- What could not be verified
- Any remaining risks or required manual configuration

Do not commit, push, deploy, or modify production settings unless explicitly instructed.