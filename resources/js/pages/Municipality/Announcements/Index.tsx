import { Archive, Check, CirclePause, FilePlus2, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import FlashMessages from '../../../components/FlashMessages';

type Announcement = {
    id: number;
    title: string;
    slug: string;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    publishedAt: string | null;
    updatedAt: string | null;
};

type AnnouncementPage = {
    data: Announcement[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from: number | null;
    to: number | null;
    total: number;
};

export default function AnnouncementIndex({
    announcements,
    baseUrl,
    filters,
    categories,
}: {
    announcements: AnnouncementPage;
    baseUrl: string;
    canManageAccounts: boolean;
    filters: { search: string; status: string; category: string };
    categories: string[];
}) {
    const form = useForm(filters);
    const flash = usePage<{ flash?: { success?: string; error?: string } }>().props.flash;

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(baseUrl, form.data, { preserveState: true, replace: true });
    }

    function setStatus(announcement: Announcement, status: Announcement['status']) {
        router.patch(
            `${baseUrl}/${announcement.id}/status`,
            { status },
            { preserveScroll: true },
        );
    }

    function removeAnnouncement(announcement: Announcement) {
        if (window.confirm(`Delete "${announcement.title}"?`)) {
            router.delete(`${baseUrl}/${announcement.id}`, {
                preserveScroll: true,
            });
        }
    }

    function restoreAnnouncement(announcement: Announcement) {
        if (window.confirm(`Restore "${announcement.title}" as a draft? It will remain hidden from visitors.`)) {
            router.patch(`${baseUrl}/${announcement.id}/restore`, {}, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Announcements" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-white sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <FlashMessages success={flash?.success} error={flash?.error} />
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Announcements</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href={baseUrl.startsWith('/super-admin') ? '/super-admin' : '/municipality-admin'}>
                                Dashboard
                            </Link>
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/content-history">Content history</Link>
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white hover:bg-[#245548]" href={`${baseUrl}/create`}>
                                <FilePlus2 className="h-4 w-4 text-white" />
                                Create Announcement
                            </Link>
                        </div>
                    </div>

                    <form onSubmit={applyFilters} className="mb-4 grid gap-3 rounded-lg border border-[#e5ddce] bg-white p-4 sm:grid-cols-[1fr_190px_190px_auto_auto]">
                        <input aria-label="Search announcements" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" placeholder="Search title or content" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} />
                        <select aria-label="Filter announcement status" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.status} onChange={(event) => form.setData('status', event.target.value)}><option value="">All statuses</option><option value="Draft">Draft</option><option value="Published">Published</option><option value="Archived">Archived</option></select>
                        <select aria-label="Filter announcement category" className="rounded-md border border-[#dcd5c8] px-3 py-2 text-sm" value={form.data.category} onChange={(event) => form.setData('category', event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                        <button className="rounded-md bg-[#173c34] px-4 py-2 text-sm font-semibold text-white" type="submit">Search</button>
                        <Link className="self-center text-center text-sm text-[#53645d] underline" href={baseUrl}>Clear</Link>
                    </form>

                    {announcements.data.length === 0 ? (
                        <div className="rounded-lg border border-[#e5ddce] bg-white px-5 py-14 text-center">
                            <p className="font-serif text-xl">No announcements yet</p>
                            <p className="mt-2 text-sm text-[#68766f]">Drafts and published updates will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-[#e5ddce] bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                                    <thead className="bg-[#f4f1e8] text-xs text-[#53645d]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Title</th>
                                            <th className="px-4 py-3 font-semibold">Category</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Updated</th>
                                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#eee7da]">
                                        {announcements.data.map((announcement) => (
                                            <tr key={announcement.id}>
                                                <td className="px-4 py-4">
                                                    <p className="font-medium">{announcement.title}</p>
                                                    <p className="mt-1 text-xs text-[#89928d]">/{announcement.slug}</p>
                                                </td>
                                                <td className="px-4 py-4 text-[#53645d]">{announcement.category}</td>
                                                <td className="px-4 py-4">
                                                    <span className="rounded-full bg-[#f4f1e8] px-2.5 py-1 text-xs font-medium">{announcement.status}</span>
                                                </td>
                                                <td className="px-4 py-4 text-xs text-[#68766f]">
                                                    {announcement.updatedAt ? new Date(announcement.updatedAt).toLocaleDateString() : '—'}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex justify-end gap-1">
                                                        <Link aria-label={`Edit ${announcement.title}`} className="rounded-md p-2 text-[#53645d] hover:bg-[#f4f1e8]" href={`${baseUrl}/${announcement.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        {announcement.status === 'Archived' ? (
                                                            <button aria-label={`Restore ${announcement.title}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => restoreAnnouncement(announcement)} type="button">
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                        ) : announcement.status !== 'Published' && (
                                                            <button aria-label={`Publish ${announcement.title}`} className="rounded-md p-2 text-[#245548] hover:bg-[#edf4ed]" onClick={() => setStatus(announcement, 'Published')} type="button">
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {announcement.status === 'Published' && (
                                                            <button aria-label={`Unpublish ${announcement.title}`} className="rounded-md p-2 text-[#9b6a28] hover:bg-[#f8f3e8]" onClick={() => setStatus(announcement, 'Draft')} type="button">
                                                                <CirclePause className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {announcement.status !== 'Archived' && (
                                                            <button aria-label={`Archive ${announcement.title}`} className="rounded-md p-2 text-[#68766f] hover:bg-[#f4f1e8]" onClick={() => setStatus(announcement, 'Archived')} type="button">
                                                                <Archive className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button aria-label={`Delete ${announcement.title}`} className="rounded-md p-2 text-red-700 hover:bg-red-50" onClick={() => removeAnnouncement(announcement)} type="button">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                        <span>Showing {announcements.from ?? 0}–{announcements.to ?? 0} of {announcements.total}</span>
                        <nav aria-label="Announcement pages" className="flex gap-1">{announcements.links.map((link, index) => <button key={`${link.label}-${index}`} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} className={`min-w-9 rounded px-2 py-1 ${link.active ? 'bg-[#173c34] text-white' : 'bg-white text-[#53645d]'} disabled:opacity-40`} type="button">{link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}</button>)}</nav>
                    </div>
                </div>
            </main>
        </>
    );
}