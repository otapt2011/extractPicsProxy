export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract the path after /api/proxy/ using the incoming URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let apiPath = url.pathname.replace(/^\/api\/proxy\/?/, '');
  if (!apiPath) apiPath = '';

  const apiUrl = `https://api.extract.pics/${apiPath}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        Authorization: req.headers['authorization'] || '',
      },
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }
    const response = await fetch(apiUrl, fetchOptions);
    const responseBody = await response.text();
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.send(responseBody);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
