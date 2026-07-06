interface Env {
  DB: D1Database;
}

interface WhitelistBody {
  email?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: CORS_HEADERS });
}
