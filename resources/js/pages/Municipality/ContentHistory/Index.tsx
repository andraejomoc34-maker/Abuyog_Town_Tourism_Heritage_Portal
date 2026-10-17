import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Change = {
    id: number;
    content_type: string;
    content_id: number | null;
    action: string;
    description: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    created_at: string;
    user: { id: number; name: string } | null;
};

type ChangePage = {
    data: Change[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

const actions = ['created', 'edited', 'published', 'unpublished', 'archived', 'restored', 'status_changed', 'deleted'];

export default function ContentHistoryIndex({
    changes,
    filters,
    canViewAll,
    contentTypes,
}: {
    changes: ChangePage;
    filters: { search: string; content_type: string; action: string };
    canViewAll: boolean;
    contentTypes: string[];
}) {
    const form = useForm(filters);
    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/content-history', form.data, { preserveState: true, replace: true });
    }

    function typeName(value: string) {
        return value.split('\\').pop()?.replace(/([a-z])([A-Z])/g, '$1 $2') ?? value;
    }

    return (
        <>
            <Head title="Content history" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div><p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">CONTENT MANAGEMENT</p><h1 className="mt-2 font-serif text-3xl">Content history</h1><p className="mt-2 text-sm text-[#68766f]">{canViewAll ? 'Recorded changes made by authorized staff.' : 'History for content managed by your assigned property.'}</p></div>
                        <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href={canViewAll ? '/municipality-admin' : '/resort-admin'}>Dashboard</Link>
                    </header>

                    <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-lg border border-[#e5ddce] bg-white p-4 sm:grid-cols-[1fr_190px_190px_auto_auto]">
                        <input aria-label="Search history" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" placeholder="Search change descriptions" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} />
                        <select aria-label="Filter content type" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.content_type} onChange={(event) => form.setData('content_type', event.target.value)}><option value="">All content types</option>{contentTypes.map((type) => <option key={type} value={type}>{typeName(type)}</option>)}</select>
                        <select aria-label="Filter change action" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.action} onChange={(event) => form.setData('action', event.target.value)}><option value="">All actions</option>{actions.map((action) => <option key={action} value={action}>{action.replace('_', ' ')}</option>)}</select>
                        <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white" type="submit">Search</button>
                        <Link className="self-center text-center text-sm text-[#53645d] underline" href="/content-history">Clear</Link>
                    </form>

                    <section className="space-y-3">
                        {changes.data.map((change) => (
                            <article key={change.id} className="rounded-lg border border-[#e5ddce] bg-white p-4 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div><p className="font-semibold">{change.description}</p><p className="mt-1 text-xs text-[#68766f]">{typeName(change.content_type)}{change.content_id ? ` #${change.content_id}` : ''} · {change.action.replace('_', ' ')}</p></div>
                                    <time className="text-xs text-[#68766f]" dateTime={change.created_at}>{new Date(change.created_at).toLocaleString()}</time>
                                </div>
                                <p className="mt-2 text-xs text-[#53645d]">By {change.user?.name ?? 'Former account'}</p>
                                {(change.before || change.after) && <details className="mt-3 text-xs text-[#53645d]"><summary className="cursor-pointer font-medium">View recorded field values</summary><div className="mt-2 grid gap-3 sm:grid-cols-2"><pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[#f8f3e8] p-3">Before: {JSON.stringify(change.before ?? {}, null, 2)}</pre><pre className="overflow-x-auto whitespace-pre-wrap rounded bg-[#f8f3e8] p-3">After: {JSON.stringify(change.after ?? {}, null, 2)}</pre></div></details>}
                            </article>
                        ))}
                        {changes.data.length === 0 && <p className="rounded-lg border border-[#e5ddce] bg-white px-5 py-12 text-center text-sm text-[#68766f]">No content history matches these filters.</p>}
                    </section>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {changes.from ?? 0}–{changes.to ?? 0} of {changes.total}</span>
                        <nav aria-label="History pages" className="flex gap-1">{changes.links.map((link, index) => <button key={`${link.label}-${index}`} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}</nav>
                    </div>
                </div>
            </main>
        </>
    );
}
