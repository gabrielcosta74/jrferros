import type { ReactNode } from 'react';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function LegalPage({ eyebrow, title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-jrs-cream">
      <section className="bg-jrs-black text-white py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <p className="text-sm font-bold text-jrs-green-start uppercase tracking-widest mb-4">{eyebrow}</p>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6">{title}</h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">{description}</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-10 text-slate-600">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-jrs-black">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalUpdatedAt() {
  return <p className="text-sm text-slate-400">Última atualização: 22 de abril de 2026.</p>;
}
