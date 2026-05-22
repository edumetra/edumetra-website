export default async function handler(req, res) {
  const supabaseBase = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!supabaseBase) {
    return res.status(500).json({ error: 'SUPABASE_URL is not configured on server' });
  }

  const rawPath = req.query.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : (rawPath || '');
  const target = `${supabaseBase.replace(/\/$/, '')}/${path}${req.url.includes('?') ? `?${req.url.split('?')[1]}` : ''}`;

  try {
    const bodyAllowed = !['GET', 'HEAD'].includes(req.method || 'GET');
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers['content-length'];

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: bodyAllowed ? JSON.stringify(req.body) : undefined,
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    return res.status(502).json({ error: 'Supabase proxy failed', details: error?.message || 'Unknown error' });
  }
}
