import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json());

const {
  SUPABASE_PROJECT_ID,
  SUPABASE_SERVICE_ROLE,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET,
} = process.env;

const supabaseUrl = SUPABASE_PROJECT_ID
  ? `https://${SUPABASE_PROJECT_ID}.supabase.co`
  : null;

function requireEnv(value: string | undefined, label: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${label}`);
  }
  return value;
}

function createToken(username: string) {
  const secret = requireEnv(ADMIN_SESSION_SECRET, 'ADMIN_SESSION_SECRET');
  const payload = {
    u: username,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string) {
  const secret = requireEnv(ADMIN_SESSION_SECRET, 'ADMIN_SESSION_SECRET');
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
    u: string;
    exp: number;
  };

  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

function readBearerToken(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length);
}

async function supabaseRequest(path: string, init?: RequestInit) {
  const serviceRole = requireEnv(SUPABASE_SERVICE_ROLE, 'SUPABASE_SERVICE_ROLE');
  const baseUrl = requireEnv(supabaseUrl ?? undefined, 'SUPABASE_PROJECT_ID');

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/contact-requests', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body ?? {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      message: String(message).trim(),
      source: 'website',
    };

    const data = await supabaseRequest('/rest/v1/contact_requests', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível guardar o pedido.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.post('/api/admin/login', (req, res) => {
  try {
    const username = requireEnv(ADMIN_USERNAME, 'ADMIN_USERNAME');
    const password = requireEnv(ADMIN_PASSWORD, 'ADMIN_PASSWORD');
    const submittedUsername = String(req.body?.username ?? '');
    const submittedPassword = String(req.body?.password ?? '');

    if (submittedUsername !== username || submittedPassword !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    return res.json({
      token: createToken(username),
      user: username,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'login_failed',
    });
  }
});

app.get('/api/admin/contact-requests', async (req, res) => {
  try {
    const token = readBearerToken(req);
    if (!token || !verifyToken(token)) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const data = await supabaseRequest('/rest/v1/contact_requests?select=*&order=created_at.desc');
    return res.json({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Não foi possível carregar os pedidos.',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
