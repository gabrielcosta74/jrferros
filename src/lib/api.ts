export interface ContactRequestPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Pedido falhou.');
  }

  return data as T;
}

export async function submitContactRequest(payload: ContactRequestPayload) {
  return apiRequest<{ success: boolean }>('/api/contact-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogin(username: string, password: string) {
  return apiRequest<{ token: string; user: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function fetchAdminContactRequests(token: string) {
  return apiRequest<{ data: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    created_at: string;
  }> }>('/api/admin/contact-requests', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
