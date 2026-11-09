# Connecting OneID (id.egov.uz)

Founders confirm who they are with OneID instead of uploading a passport.
Everything on Fundy's side is built; it stays switched off until Fundy has OneID keys.
Until then, an admin confirms each founder on a short video call
(Admin → review a project → **Identity** → "Confirm identity after a video call").

## 1. Get access (you)

1. Apply to connect Fundy to OneID. Applications go to the Ministry of Digital
   Technologies / UZINFOCOM, starting from **id.egov.uz**. You will most likely need to
   apply as a registered company.
2. When they ask for a **redirect (return) address**, give exactly:
   `https://fjhywrgtexzpbwimfhyd.supabase.co/functions/v1/oneid`
3. Ask for these fields: full name, personal number (PINFL / JShShIR), passport number,
   date of birth, and company details (TIN, name) for people who sign in with a company
   e-signature key.
4. They give you a **client ID**, a **client secret** and a **scope**, plus their technical
   description. Keep the secret private. Never paste it into a chat or the site code.

## 2. Switch it on (with Claude's help)

1. Supabase → Edge Functions → Secrets: add `ONEID_CLIENT_ID`, `ONEID_CLIENT_SECRET`
   and `ONEID_SCOPE` (type them in yourself).
2. Compare OneID's technical description with `supabase/functions/oneid/index.ts`
   (addresses, `grant_type` names, field names such as `pin` and `pport_no`) and adjust
   anything that differs.
3. Deploy: `npx supabase functions deploy oneid --no-verify-jwt`
4. Vercel → Settings → Environment Variables: add `VITE_ONEID_ENABLED` = `true`, then
   redeploy. The "Verify with OneID" button in step 6 becomes active.
5. Try it once with your own OneID account.

## What is stored

Table `founder_identities` (only the founder and admins can read it; nobody can write
to it from the site): method (`oneid` or `video_call`), name, PINFL, passport number,
birth date, company TIN and name. No scans or photos.
An admin can approve a project only after its founder's identity is confirmed.
