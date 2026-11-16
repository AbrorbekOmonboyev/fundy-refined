/**
 * OneID (id.egov.uz) identity check for founders (Supabase Edge Function).
 * Ready, but OFF until Fundy has OneID keys. See docs/ONEID.md.
 *
 *   1. POST {action:'start', returnTo}  (signed-in founder, from the "Verify with OneID" button)
 *      → {url}: the OneID sign-in page. `state` is signed, so nobody can swap accounts.
 *   2. GET ?code&state                  (OneID sends the founder back here)
 *      → asks OneID who this is, saves it in founder_identities, then
 *        redirects to fundy.uz<returnTo>?oneid=ok (or ?oneid=error).
 *
 * Nothing is uploaded and no passport scan is stored: only the name, personal number
 * (PINFL), passport number, birth date and, when signed in with a company key, the
 * company's TIN and name. Only the founder and admins can read them.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   ONEID_CLIENT_ID       given by OneID when Fundy is connected
 *   ONEID_CLIENT_SECRET   given by OneID (never in the site code or in chat)
 *   ONEID_SCOPE           the scope OneID gives with the keys (often the same as the client ID)
 *   ONEID_BASE_URL        optional; default https://sso.egov.uz/sso/oauth/Authorization.do
 * SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
 *
 * Deploy: npx supabase functions deploy oneid --no-verify-jwt
 *   (OneID's redirect carries no login token; step 1 checks the founder's token itself.)
 */
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

const SITE = 'https://www.fundy.uz';
const CLIENT_ID = Deno.env.get('ONEID_CLIENT_ID') ?? '';
const CLIENT_SECRET = Deno.env.get('ONEID_CLIENT_SECRET') ?? '';
const SCOPE = Deno.env.get('ONEID_SCOPE') ?? CLIENT_ID;
const ONEID = Deno.env.get('ONEID_BASE_URL') ?? 'https://sso.egov.uz/sso/oauth/Authorization.do';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const CALLBACK = `${SUPABASE_URL}/functions/v1/oneid`;
const STATE_TTL_MS = 15 * 60_000;

const admin = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const back = (returnTo: string, result: 'ok' | 'error') =>
  Response.redirect(`${SITE}${returnTo}${returnTo.includes('?') ? '&' : '?'}oneid=${result}`, 302);

// ---------------------------------------------------------------------------
// Signed state: user id + where to return + expiry, so the callback needs no table.
// ---------------------------------------------------------------------------
const enc = new TextEncoder();
const b64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
async function sign(text: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(CLIENT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}
async function makeState(userId: string, returnTo: string) {
  const payload = b64url(enc.encode(JSON.stringify({ u: userId, r: returnTo, e: Date.now() + STATE_TTL_MS })));
  return `${payload}.${await sign(payload)}`;
}
async function readState(state: string): Promise<{ u: string; r: string } | null> {
  const [payload, sig] = state.split('.');
  if (!payload || !sig || !(await safeEqual(await sign(payload), sig))) return null;
  const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  return Date.now() < data.e ? data : null;
}

/** Constant-time text comparison (hashes first so length is not leaked either). */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const te = new TextEncoder();
  const [x, y] = await Promise.all(
    [a, b].map(async s => new Uint8Array(await crypto.subtle.digest('SHA-256', te.encode(s)))),
  );
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** Only paths on fundy.uz, e.g. /start/abc/founder. */
const safePath = (p: unknown) => (typeof p === 'string' && /^\/(?!\/)[\w\-/]*$/.test(p) ? p : '/');

// ---------------------------------------------------------------------------
// OneID calls (form-encoded POSTs to the same address)
// ---------------------------------------------------------------------------
async function oneid(params: Record<string, string>) {
  const res = await fetch(ONEID, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error(`oneid ${res.status}`);
  return await res.json();
}

type OneIdPerson = {
  pin?: string;
  full_name?: string;
  sur_name?: string;
  first_name?: string;
  mid_name?: string;
  pport_no?: string;
  birth_date?: string;
  legal_info?: { is_basic?: boolean; tin?: string; le_name?: string; acron_UZ?: string }[];
};

/** "1990-05-31" or "31.05.1990" → "1990-05-31"; anything else → null. */
function isoDate(d?: string) {
  if (!d) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

async function finish(code: string, userId: string) {
  const token = await oneid({
    grant_type: 'one_authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: CALLBACK,
  });
  const person: OneIdPerson = await oneid({
    grant_type: 'one_access_token_identify',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    access_token: token.access_token,
    scope: SCOPE,
  });
  if (!person.pin || !/^\d{14}$/.test(person.pin)) throw new Error('oneid: no personal number');

  const company = person.legal_info?.find(l => l.is_basic) ?? person.legal_info?.[0];
  const fullName = person.full_name ?? [person.sur_name, person.first_name, person.mid_name].filter(Boolean).join(' ');
  const { error } = await admin.from('founder_identities').upsert({
    user_id: userId,
    method: 'oneid',
    full_name: fullName.slice(0, 200) || null,
    pinfl: person.pin,
    passport_number: person.pport_no?.slice(0, 20) ?? null,
    birth_date: isoDate(person.birth_date),
    company_tin: company?.tin && /^\d{9}$/.test(company.tin) ? company.tin : null,
    company_name: (company?.le_name ?? company?.acron_UZ)?.slice(0, 300) ?? null,
    note: null,
    verified_at: new Date().toISOString(),
    verified_by: null,
  });
  if (error) throw error;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (!CLIENT_ID || !CLIENT_SECRET) return json({ error: 'not_configured' }, 503);

  // 2. OneID sends the founder back here.
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const state = await readState(url.searchParams.get('state') ?? '').catch(() => null);
    if (!state) return back('/', 'error');
    const code = url.searchParams.get('code');
    if (!code) return back(state.r, 'error');
    try {
      await finish(code, state.u);
      return back(state.r, 'ok');
    } catch (e) {
      console.error('oneid callback failed', e instanceof Error ? e.message : e);
      return back(state.r, 'error');
    }
  }

  // 1. The signed-in founder presses "Verify with OneID".
  const jwt = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const { data } = jwt ? await admin.auth.getUser(jwt) : { data: { user: null } };
  if (!data.user) return json({ error: 'not_signed_in' }, 401);
  const body = await req.json().catch(() => ({}));
  if (body.action !== 'start') return json({ error: 'bad_request' }, 400);

  const params = new URLSearchParams({
    response_type: 'one_code',
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK,
    scope: SCOPE,
    state: await makeState(data.user.id, safePath(body.returnTo)),
  });
  return json({ url: `${ONEID}?${params}` });
});
