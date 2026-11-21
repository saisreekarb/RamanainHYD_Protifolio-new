import { getSupabase, setCors, needEnv } from '../lib/server.js';

const defaults = {
  id: 1,
  name: 'YOUR NAME',
  role: 'Video Editor & Creative Storyteller',
  tagline: 'Stories worth watching.',
  about: 'I create compelling visuals and memorable stories. Update this from your admin dashboard.',
  email: 'hello@example.com',
  instagram: '',
  youtube: '',
  skills: ['Video Editing', 'Color Grading', 'Motion Graphics']
};

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (needEnv(res, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'])) return;

  try {
    const supabase = getSupabase();
    const [profileResult, projectsResult] = await Promise.all([
      supabase.from('portfolio').select('*').eq('id', 1).maybeSingle(),
      supabase.from('projects').select('*').order('created_at', { ascending: false })
    ]);

    if (profileResult.error) throw profileResult.error;
    if (projectsResult.error) throw projectsResult.error;

    return res.status(200).json({
      ...defaults,
      ...(profileResult.data || {}),
      projects: projectsResult.data || []
    });
  } catch (error) {
    console.error('GET /api/portfolio failed:', error);
    return res.status(500).json({ error: 'Could not load portfolio' });
  }
}
