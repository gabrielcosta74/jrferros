import crypto from 'node:crypto';

type ApiRequest = {
  body?: {
    username?: unknown;
    password?: unknown;
  };
  method?: string;
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): ApiResponse;
  json(body: unknown): void;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createToken(username: string) {
  const secret = requiredEnv('ADMIN_SESSION_SECRET');
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

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const username = requiredEnv('ADMIN_USERNAME');
    const password = requiredEnv('ADMIN_PASSWORD');
    const submittedUsername = String(req.body?.username ?? '');
    const submittedPassword = String(req.body?.password ?? '');

    if (submittedUsername !== username || submittedPassword !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    return res.status(200).json({
      token: createToken(username),
      user: username,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'login_failed',
    });
  }
}
