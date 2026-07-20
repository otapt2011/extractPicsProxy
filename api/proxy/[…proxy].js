export default async function handler(req, res) {
  // ── CORS ───────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ── Build the target URL ──────────────────────────────
  // req.query.proxy is an array containing the path segments after /api/proxy
  // e.g., /api/proxy/v0/extractions  →  proxy = ["v0", "extractions"]
  const apiPath = req.query.proxy ? req.query.proxy.join('/') : '';
  const apiUrl = `https://api.extract.pics/${apiPath}`;

  try {
    // ── Forward the request ─────────────────────────────
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Authorization': req.headers['authorization'] || '',
      },
    };

    // Include body for non‑GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(apiUrl, fetchOptions);

    // ── Forward the response ────────────────────────────
    const responseBody = await response.text();         // may be JSON or binary
    res.status(response.status);

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.send(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
