import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';

type EventRecord = {
    id: number;
    actor: { name: string } | null;
    target_user: { name: string; email: string } | null;
    scam_report: { reported_account: string } | null;
    action: string;
    reason: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
};

type Paginator<T> = { data: T[]; links: Array<{ url: string | null; label: string; active: boolean }>; from: number | null; to: number | null; total: number };

export default function AccountSecurityHistory({ events, actions, filter }: { events: Paginator<EventRecord>; actions: string[]; filter: string }) {
    function changeFilter(event: FormEvent<HTMLSelectElement>) {
        router.get('/super-admin/account-security-history', { action: event.currentTarget.value }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Account Security History" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#ded7c8] pb-5">
                        <div><p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">SUPER ADMIN</p><h1 className="mt-2 font-serif text-3xl">Account security history</h1></div>
                        <nav className="flex gap-4 text-sm font-semibold text-[#245548]"><Link className="underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/accounts">Registered users</Link><Link className="underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/account-reports">Scam reports</Link></nav>
                    </header>
                    <label className="mb-4 block max-w-sm text-sm font-medium" htmlFor="event-filter">Filter events</label>
                    <select className="mb-5 w-full max-w-sm rounded-md border border-[#dcd5c8] bg-white px-3 py-2 text-sm" id="event-filter" onChange={changeFilter} value={filter}>
                        <option value="">All events</option>{actions.map((action) => <option key={action} value={action}>{action.replaceAll('_', ' ')}</option>)}
                    </select>
                    <div className="space-y-3">
                        {events.data.map((event) => (
                            <article className="rounded-lg border border-[#e5ddce] bg-white p-4 sm:p-5" key={event.id}>
                                <div className="flex flex-wrap justify-between gap-2">
                                    <h2 className="font-semibold">{event.action.replaceAll('_', ' ')}</h2>
                                    <time className="text-xs text-[#68766f]">{new Date(event.created_at).toLocaleString()}</time>
                                </div>
                                <p className="mt-2 text-sm text-[#53645d]">Actor: {event.actor?.name ?? 'System or deleted account'} · Target: {event.target_user?.name ?? event.scam_report?.reported_account ?? 'Not linked'}</p>
                                {event.target_user && <p className="mt-1 text-xs text-[#68766f]">{event.target_user.email}</p>}
                                {event.reason && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{event.reason}</p>}
                            </article>
                        ))}
                        {events.data.length === 0 && <p className="rounded-lg border border-[#e5ddce] bg-white px-4 py-10 text-center text-sm text-[#68766f]">No security events have been recorded yet.</p>}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {events.from ?? 0}–{events.to ?? 0} of {events.total}</span>
                        <nav aria-label="Security event pages" className="flex gap-1">{events.links.map((link, index) => <button className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} disabled={!link.url} key={`${link.label}-${index}`} onClick={() => link.url && router.visit(link.url)} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}</nav>
                    </div>
                </div>
            </main>
        </>
    );
}
