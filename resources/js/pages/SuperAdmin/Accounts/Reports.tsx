import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FlashMessages from '../../../components/FlashMessages';

type Report = {
    id: number;
    reported_account: string;
    reason: string;
    description: string;
    activity_reference: string | null;
    status: string;
    review_notes: string | null;
    reviewed_at: string | null;
    created_at: string;
};

type Paginator<T> = {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

function ReportReview({ report, statuses }: { report: Report; statuses: string[] }) {
    const form = useForm({
        status: report.status,
        review_notes: report.review_notes ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.patch(`/super-admin/account-reports/${report.id}`, { preserveScroll: true });
    }

    return (
        <article className="rounded-lg border border-[#e5ddce] bg-white p-5">
            <div className="flex flex-wrap justify-between gap-3">
                <div>
                    <p className="text-xs text-[#68766f]">Report #{report.id} · {new Date(report.created_at).toLocaleString()}</p>
                    <h2 className="mt-1 font-semibold">{report.reported_account}</h2>
                </div>
                <span className="h-fit rounded-full bg-[#f4f1e8] px-3 py-1 text-xs font-semibold">{report.status.replaceAll('_', ' ')}</span>
            </div>
            <p className="mt-3 text-sm"><strong>Reason:</strong> {report.reason.replaceAll('_', ' ')}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#53645d]">{report.description}</p>
            {report.activity_reference && <p className="mt-2 text-xs text-[#68766f]">Reference: {report.activity_reference}</p>}
            <form className="mt-4 grid gap-3 border-t border-[#eee7da] pt-4 sm:grid-cols-[190px_1fr_auto]" onSubmit={submit}>
                <div>
                    <label className="sr-only" htmlFor={`status-${report.id}`}>Review status</label>
                    <select className="w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id={`status-${report.id}`} onChange={(event) => form.setData('status', event.target.value)} value={form.data.status}>
                        {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                    </select>
                    {form.errors.status && <p className="mt-1 text-xs text-red-700">{form.errors.status}</p>}
                </div>
                <div>
                    <label className="sr-only" htmlFor={`notes-${report.id}`}>Private review notes and outcome</label>
                    <textarea className="min-h-10 w-full rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" id={`notes-${report.id}`} maxLength={3000} onChange={(event) => form.setData('review_notes', event.target.value)} placeholder="Private review notes and outcome (required)" value={form.data.review_notes} />
                    {form.errors.review_notes && <p className="mt-1 text-xs text-red-700">{form.errors.review_notes}</p>}
                </div>
                <button className="min-h-10 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={form.processing} type="submit">{form.processing ? 'Saving…' : 'Save review'}</button>
            </form>
        </article>
    );
}

export default function AccountReports({ reports, filters, statuses }: { reports: Paginator<Report>; filters: { search: string; status: string }; statuses: string[] }) {
    const form = useForm(filters);
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get('/super-admin/account-reports', form.data, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Scam and Abuse Reports" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <header className="mb-6 border-b border-[#ded7c8] pb-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div><p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">SUPER ADMIN</p><h1 className="mt-2 font-serif text-3xl">Scam and abuse reports</h1></div>
                            <nav className="flex gap-4 text-sm font-semibold text-[#245548]"><Link className="underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/accounts">Registered users</Link><Link className="underline decoration-[#d99d4b] underline-offset-4" href="/super-admin/account-security-history">Security history</Link></nav>
                        </div>
                        <p className="mt-3 text-sm text-[#53645d]">Reports are allegations for review. Submitting or reviewing a report does not automatically suspend an account.</p>
                    </header>
                    <form className="mb-4 grid gap-3 rounded-lg border border-[#e5ddce] bg-white p-4 sm:grid-cols-[1fr_190px_auto_auto]" onSubmit={applyFilters}>
                        <input aria-label="Search reports" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" onChange={(event) => form.setData('search', event.target.value)} placeholder="Search identifier or description" value={form.data.search} />
                        <select aria-label="Filter reports by status" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" onChange={(event) => form.setData('status', event.target.value)} value={form.data.status}>
                            <option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                        </select>
                        <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white" type="submit">Filter</button>
                        <Link className="self-center text-center text-sm underline" href="/super-admin/account-reports">Clear</Link>
                    </form>
                    <div className="space-y-3">
                        {reports.data.map((report) => <ReportReview key={report.id} report={report} statuses={statuses} />)}
                        {reports.data.length === 0 && <p className="rounded-lg border border-[#e5ddce] bg-white px-4 py-10 text-center text-sm text-[#68766f]">No reports match these filters.</p>}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {reports.from ?? 0}–{reports.to ?? 0} of {reports.total}</span>
                        <nav aria-label="Report pages" className="flex gap-1">
                            {reports.links.map((link, index) => <button className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} disabled={!link.url} key={`${link.label}-${index}`} onClick={() => link.url && router.visit(link.url)} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}
                        </nav>
                    </div>
                </div>
            </main>
        </>
    );
}
