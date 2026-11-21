import { getSupabase, setCors, isAdmin, needEnv } from '../lib/server.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (needEnv(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SESSION_SECRET', 'ADMIN_EMAIL'])) return;
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = req.body || {};
    const row = {
      id: 1,
      name: String(body.name || '').slice(0, 100),
      role: String(body.role || '').slice(0, 140),
      tagline: String(body.tagline || '').slice(0, 180),
      about: String(body.about || '').slice(0, 4000),
      email: String(body.email || '').slice(0, 200),
      instagram: String(body.instagram || '').slice(0, 300),
      youtube: String(body.youtube || '').slice(0, 300),
      skills: Array.isArray(body.skills) ? body.skills.slice(0, 30).map((item) => String(item).slice(0, 60)) : []
    };

    const { data, error } = await getSupabase().from('portfolio').upsert(row).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error('PUT /api/profile failed:', error);
    return res.status(500).json({ error: 'Could not save profile' });
  }
}
