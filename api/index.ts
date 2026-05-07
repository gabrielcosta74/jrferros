let appPromise: Promise<typeof import('../server/index').default> | null = null;

function loadApp() {
  appPromise ??= import('../server/index').then((module) => module.default);
  return appPromise;
}

export default async function handler(req: Parameters<Awaited<ReturnType<typeof loadApp>>>[0], res: Parameters<Awaited<ReturnType<typeof loadApp>>>[1]) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (error) {
    console.error('API bootstrap failed', error);
    const response = res as {
      status: (code: number) => { json: (body: unknown) => void };
    };

    return response.status(500).json({
      error: 'API bootstrap failed',
      details: error instanceof Error ? error.message : 'unknown_error',
    });
  }
}
