export default async function handler(req, res) {
  // Allow CORS from any origin (so file:// works)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // The API path is whatever comes after /api/proxy
  // e.g., /api/proxy/v0/extractions -> v0/extractions
  const apiPath = req.url.replace(/^\/api\/proxy\/?/, '');
  const apiUrl = `https://api.extract.pics/${apiPath}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Authorization': req.headers['authorization'] || '',
      },
    };

    // Forward body for POST/PUT etc.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(apiUrl, fetchOptions);

    // Forward status and headers
    const responseData = await response.text();
    res.status(response.status);

    // Forward content-type header
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    res.send(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
