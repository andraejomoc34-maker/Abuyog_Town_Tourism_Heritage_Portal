import { Archive, Check, CirclePause, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';

type Announcement = {
    id: number;
    title: string;
    slug: string;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    publishedAt: string | null;
    updatedAt: string | null;
};

export default function AnnouncementIndex({
    announcements,
    baseUrl,
}: {
    announcements: Announcement[];
    baseUrl: string;
    canManageAccounts: boolean;
}) {
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

    return (
        <>
            <Head title="Announcements" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-5">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                            <h1 className="mt-2 font-serif text-3xl font-normal">Announcements</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href={baseUrl.startsWith('/super-admin') ? '/super-admin' : '/municipality-admin'}>
                                Dashboard
                            </Link>
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white hover:bg-[#245548]" href={`${baseUrl}/create`}>
                                <FilePlus2 className="h-4 w-4 text-[#edbd73]" />
                                Create Announcement
                            </Link>
                        </div>
                    </div>

                    {announcements.length === 0 ? (
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
                                        {announcements.map((announcement) => (
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
                                                        {announcement.status !== 'Published' && (
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
                </div>
            </main>
        </>
    );
}