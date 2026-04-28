import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Eye, LogOut, Mail, Phone, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { adminLogin, fetchAdminContactRequests } from '@/src/lib/api';

const ADMIN_TOKEN_KEY = 'jrs_admin_token';

interface ContactRequestItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  created_at: string;
}

export function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [items, setItems] = useState<ContactRequestItem[]>([]);
  const [selected, setSelected] = useState<ContactRequestItem | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchAdminContactRequests(token);
        setItems(response.data);
        setSelected(response.data[0] ?? null);
      } catch (loadError) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os pedidos.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.name, item.email, item.phone, item.message].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [items, query]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await adminLogin(username, password);
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      setToken(response.token);
      setUsername('');
      setPassword('');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Falha no login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setItems([]);
    setSelected(null);
    setQuery('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-jrs-green-start/10 text-jrs-green-start">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Admin</h1>
            <p className="mt-2 text-sm text-slate-500">Acesso reservado para consulta de pedidos recebidos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-sm font-semibold text-slate-700">Utilizador</label>
              <Input
                id="admin-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-semibold text-slate-700">Password</label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl bg-slate-50"
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? 'A validar...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="container flex flex-col gap-4 px-4 py-6 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Pedidos de Clientes</h1>
            <p className="mt-1 text-sm text-slate-500">Consulta simples dos pedidos recebidos pelo formulário do site.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full min-w-[240px] lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar pedidos..."
                className="h-11 rounded-xl bg-slate-50 pl-10"
              />
            </div>
            <Button variant="outline" className="h-11 rounded-xl border-slate-300" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-6 px-4 py-8 md:px-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="text-sm font-semibold text-slate-700">
              {isLoading ? 'A carregar...' : `${filteredItems.length} pedido(s)`}
            </p>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={`w-full cursor-pointer border-b border-slate-100 px-6 py-4 text-left transition-colors hover:bg-slate-50 ${
                  selected?.id === item.id ? 'bg-jrs-green-start/5' : 'bg-white'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="truncate text-sm font-bold text-slate-900">{item.name}</h2>
                  <span className="shrink-0 text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleString('pt-PT')}
                  </span>
                </div>
                <p className="truncate text-sm text-slate-500">{item.email}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.message}</p>
              </button>
            ))}
            {!isLoading && filteredItems.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                Sem pedidos para mostrar.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">{selected.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Recebido em {new Date(selected.created_at).toLocaleString('pt-PT')}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-jrs-green-start/10 px-4 py-2 text-sm font-medium text-jrs-green-start">
                  <Eye className="h-4 w-4" />
                  {selected.source}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <a href={`mailto:${selected.email}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-jrs-green-start/40">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Mail className="h-4 w-4 text-jrs-green-start" />
                    {selected.email}
                  </div>
                </a>
                <a href={`tel:${selected.phone}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-jrs-green-start/40">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Telefone</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Phone className="h-4 w-4 text-jrs-green-start" />
                    {selected.phone}
                  </div>
                </a>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Mensagem</p>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{selected.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-slate-400">
              Selecione um pedido.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
