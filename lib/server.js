import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

// Create the privileged Supabase client only when an API route actually needs it.
// This prevents missing environment variables from crashing the function at import time.
let supabaseClient;
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return supabaseClient;
}

const secret = () => process.env.SESSION_SECRET;

export function setCors(req, res) {
  // The portfolio normally calls its API on the same origin, so CORS is not
  // required. If SITE_URL is configured, allow only that exact origin.
  const allowedOrigin = process.env.SITE_URL;
  const requestOrigin = req.headers?.origin;
  if (allowedOrigin && requestOrigin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function issueCookie(res, email) {
  if (!secret()) throw new Error('SESSION_SECRET environment variable is missing');
  const payload = Buffer.from(JSON.stringify({
    email,
    exp: Date.now() + 7 * 864e5
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `rh_session=${payload}.${signature}; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=604800`);
}

export function clearCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  res.setHeader('Set-Cookie', `rh_session=; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=0`);
}

export function isAdmin(req) {
  try {
    if (!secret() || !process.env.ADMIN_EMAIL) return false;
    const raw = (req.headers?.cookie || '')
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('rh_session='))
      ?.slice('rh_session='.length);
    if (!raw) return false;

    const [payload, signature] = raw.split('.');
    if (!payload || !signature) return false;

    const expected = crypto.createHmac('sha256', secret()).update(payload).digest();
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return false;
    }

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() && data.email === process.env.ADMIN_EMAIL;
  } catch {
    return false;
  }
}

// Each endpoint checks only the variables it actually depends on.
export function needEnv(res, keys = []) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    res.status(503).json({ error: `Missing environment variables: ${missing.join(', ')}` });
    return true;
  }
  return false;
}
