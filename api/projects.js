import { getSupabase, setCors, isAdmin, needEnv } from '../lib/server.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (needEnv(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SESSION_SECRET', 'ADMIN_EMAIL'])) return;
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const supabase = getSupabase();

    if (req.method === 'POST') {
      const body = req.body || {};
      if (!body.title || !body.url || !body.public_id) {
        return res.status(400).json({ error: 'Title and uploaded media required' });
      }

      const row = {
        title: String(body.title).slice(0, 120),
        description: String(body.description || '').slice(0, 1000),
        url: String(body.url),
        type: body.type === 'video' ? 'video' : 'image',
        public_id: String(body.public_id)
      };
      const { data, error } = await supabase.from('projects').insert(row).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    const id = String(req.query?.id || '');
    if (!id) return res.status(400).json({ error: 'Project id is required' });
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(`${req.method} /api/projects failed:`, error);
    return res.status(500).json({ error: 'Project operation failed' });
  }
}
