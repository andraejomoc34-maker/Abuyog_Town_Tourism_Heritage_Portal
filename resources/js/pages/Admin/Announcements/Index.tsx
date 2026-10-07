import { Head, Link, router } from '@inertiajs/react';
import { Archive, Pencil, Send } from 'lucide-react';

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

export default function ResortAnnouncementsIndex({ announcements }: { announcements: Announcement[] }) {
    const updateStatus = (announcement: Announcement, status: Announcement['status']) => {
        router.patch(`/resort-admin/announcements/${announcement.id}/status`, { status }, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Resort announcements" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7 flex flex-col gap-4 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Resort communications</p>
                            <h1 className="mt-2 font-serif text-3xl">Resort announcements</h1>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/resort-admin" className="rounded-none border border-[#d7cdb8] px-4 py-2.5 text-xs font-semibold">Dashboard</Link>
                            <Link href="/resort-admin/announcements/create" className="rounded-none bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white">Create announcement</Link>
                        </div>
                    </header>

                    <div className="space-y-3">
                        {announcements.length === 0 && (
                            <p className="rounded-[20px] border border-[#e9e0d0] bg-white p-8 text-center text-sm text-[#718078]">No resort announcements yet.</p>
                        )}
                        {announcements.map((announcement) => (
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
                                    {announcement.status !== 'Published' ? (
                                        <button type="button" onClick={() => updateStatus(announcement, 'Published')} className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#173c34] px-3 py-2 text-xs font-semibold text-white"><Send size={14} /> Publish</button>
                                    ) : (
                                        <button type="button" onClick={() => updateStatus(announcement, 'Archived')} className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#d7cdb8] px-3 py-2 text-xs font-semibold"><Archive size={14} /> Archive</button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
