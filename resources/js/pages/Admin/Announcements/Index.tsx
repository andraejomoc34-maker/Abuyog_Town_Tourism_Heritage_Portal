import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Archive, Pencil, RotateCcw, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import FlashMessages from '../../../components/FlashMessages';

type Announcement = {
    id: number;
    title: string;
    excerpt?: string | null;
    featuredImageUrl?: string | null;
    status: 'Draft' | 'Published' | 'Archived';
    publishedAt?: string | null;
    updatedAt: string;
};

const statusClass: Record<Announcement['status'], string> = {
    Draft: 'bg-[#fef3c7] text-[#854d0e]',
    Published: 'bg-[#dcfce7] text-[#166534]',
    Archived: 'bg-[#e5e7eb] text-[#374151]',
};

const formatDate = (value?: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not published';

type AnnouncementPage = {
    data: Announcement[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

export default function ResortAnnouncementsIndex({
    announcements,
    filters,
    categories,
}: {
    announcements: AnnouncementPage;
    filters: { search: string; status: string; category: string };
    categories: string[];
}) {
    const form = useForm(filters);
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/resort-admin/announcements', form.data, { preserveState: true, replace: true });
    };

    const updateStatus = (announcement: Announcement, status: Announcement['status']) => {
        router.patch(`/resort-admin/announcements/${announcement.id}/status`, { status }, { preserveScroll: true });
    };
    const restore = (announcement: Announcement) => {
        if (window.confirm(`Restore "${announcement.title}" as a draft? It will remain hidden from visitors.`)) {
            router.patch(`/resort-admin/announcements/${announcement.id}/restore`, {}, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Resort announcements" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <header className="mb-7 flex flex-col gap-4 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Resort communications</p>
                            <h1 className="mt-2 font-serif text-3xl">Resort announcements</h1>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/resort-admin" className="rounded-none border border-[#d7cdb8] px-4 py-2.5 text-xs font-semibold">Dashboard</Link>
                            <Link href="/content-history" className="rounded-none border border-[#d7cdb8] px-4 py-2.5 text-xs font-semibold">Content history</Link>
                            <Link href="/resort-admin/announcements/create" className="rounded-none bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white">Create announcement</Link>
                        </div>
                    </header>

                    <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-[20px] border border-[#e9e0d0] bg-white p-4 sm:grid-cols-[1fr_170px_170px_auto_auto]">
                        <input aria-label="Search announcements" className="rounded border border-[#d7cdb8] px-3 py-2 text-sm" placeholder="Search title or content" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} />
                        <select aria-label="Filter announcement status" className="rounded border border-[#d7cdb8] px-3 py-2 text-sm" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}><option value="">All statuses</option><option value="Draft">Draft</option><option value="Published">Published</option><option value="Archived">Archived</option></select>
                        <select aria-label="Filter announcement category" className="rounded border border-[#d7cdb8] px-3 py-2 text-sm" value={form.data.category} onChange={(event) => form.setData('category', event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                        <button className="rounded bg-[#173c34] px-4 py-2 text-sm font-semibold text-white" type="submit">Search</button>
                        <Link className="self-center text-center text-sm underline" href="/resort-admin/announcements">Clear</Link>
                    </form>
                    <div className="space-y-3">
                        {announcements.data.length === 0 && (
                            <p className="rounded-[20px] border border-[#e9e0d0] bg-white p-8 text-center text-sm text-[#718078]">No resort announcements yet.</p>
                        )}
                        {announcements.data.map((announcement) => (
                            <article key={announcement.id} className="flex flex-col gap-4 rounded-[20px] border border-[#e9e0d0] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,52,.04)] sm:flex-row">
                                {announcement.featuredImageUrl && <img src={announcement.featuredImageUrl} alt="" className="h-28 w-full rounded-xl object-cover sm:w-40" />}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-serif text-xl">{announcement.title}</h2>
                                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass[announcement.status]}`}>{announcement.status}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-[#53645d]">{announcement.excerpt || 'No summary provided.'}</p>
                                    <p className="mt-3 text-xs text-[#718078]">Published: {formatDate(announcement.publishedAt)} · Updated {formatDate(announcement.updatedAt)}</p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                                    <Link href={`/resort-admin/announcements/${announcement.id}/edit`} className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#d7cdb8] px-3 py-2 text-xs font-semibold"><Pencil size={14} /> Edit</Link>
                                    {announcement.status === 'Archived' ? (
                                        <button type="button" onClick={() => restore(announcement)} className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#d7cdb8] px-3 py-2 text-xs font-semibold"><RotateCcw size={14} /> Restore draft</button>
                                    ) : announcement.status !== 'Published' ? (
                                        <button type="button" onClick={() => updateStatus(announcement, 'Published')} className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#173c34] px-3 py-2 text-xs font-semibold text-white"><Send size={14} /> Publish</button>
                                    ) : (
                                        <button type="button" onClick={() => updateStatus(announcement, 'Archived')} className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#d7cdb8] px-3 py-2 text-xs font-semibold"><Archive size={14} /> Archive</button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]"><span>Showing {announcements.from ?? 0}–{announcements.to ?? 0} of {announcements.total}</span><nav aria-label="Announcement pages" className="flex gap-1">{announcements.links.map((link, index) => <button key={`${link.label}-${index}`} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}</nav></div>
                </div>
            </main>
        </>
    );
}
