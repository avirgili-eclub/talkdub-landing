interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

interface WhitelistBody {
  email?: string;
}

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/whitelist') {
      return handleWhitelistRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleWhitelistRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let body: WhitelistBody;
  try {
    body = (await request.json()) as WhitelistBody;
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const email = body.email?.toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  try {
    await env.DB.prepare('INSERT INTO whitelist (email) VALUES (?)')
      .bind(email)
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('UNIQUE constraint failed')) {
      return json({ error: 'already_registered' }, 409);
    }

    console.error('Whitelist insert failed:', error);
    return json({ error: 'internal_error' }, 500);
  }

  return json({ success: true }, 201);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}
