import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type AnnouncementDraft = {
    id: number;
    title: string;
    excerpt: string | null;
    content: string;
    featuredImageUrl: string | null;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    publishedAt: string | null;
};

type AnnouncementFormData = {
    title: string;
    excerpt: string;
    content: string;
    featured_image: File | null;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    published_at: string;
};

const inputClass = 'w-full rounded-xl border border-[#dcd5c8] bg-white px-3.5 py-3 text-sm text-[#173c34] outline-none focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20';

export default function ResortAnnouncementForm({
    announcement,
    categories,
}: {
    announcement: AnnouncementDraft | null;
    categories: string[];
}) {
    const form = useForm<AnnouncementFormData>({
        title: announcement?.title ?? '',
        excerpt: announcement?.excerpt ?? '',
        content: announcement?.content ?? '',
        featured_image: null,
        category: announcement?.category ?? categories[0] ?? 'Resort Update',
        status: announcement?.status ?? 'Draft',
        published_at: announcement?.publishedAt ?? '',
    });

    const save = (status: AnnouncementFormData['status']) => {
        form.transform((data) => ({ ...data, status }));
        if (announcement) {
            form.put(`/resort-admin/announcements/${announcement.id}`);
            return;
        }

        form.post('/resort-admin/announcements');
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        save(form.data.status);
    };

    return (
        <>
            <Head title={announcement ? 'Edit resort announcement' : 'Create resort announcement'} />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6">
                <div className="mx-auto max-w-3xl">
                    <Link href="/resort-admin/announcements" className="inline-flex items-center gap-2 text-sm font-medium text-[#53645d] hover:text-[#173c34]"><ArrowLeft size={16} /> Announcements</Link>
                    <header className="mt-5 border-b border-[#ded7c8] pb-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b6a28]">Resort communications</p>
                        <h1 className="mt-2 font-serif text-3xl">{announcement ? 'Edit announcement' : 'Create announcement'}</h1>
                    </header>

                    <form onSubmit={submit} className="mt-6 space-y-5 rounded-[20px] border border-[#e9e0d0] bg-white p-5 shadow-[0_10px_28px_rgba(23,60,52,.05)] sm:p-7">
                        <div>
                            <label htmlFor="announcement-title" className="mb-2 block text-sm font-semibold">Title</label>
                            <input id="announcement-title" className={inputClass} maxLength={255} value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} required />
                            {form.errors.title && <p className="mt-1 text-xs text-red-700">{form.errors.title}</p>}
                        </div>
                        <div>
                            <label htmlFor="announcement-excerpt" className="mb-2 block text-sm font-semibold">Excerpt</label>
                            <textarea id="announcement-excerpt" className={inputClass} rows={2} maxLength={500} value={form.data.excerpt} onChange={(event) => form.setData('excerpt', event.target.value)} />
                            {form.errors.excerpt && <p className="mt-1 text-xs text-red-700">{form.errors.excerpt}</p>}
                        </div>
                        <div>
                            <label htmlFor="announcement-content" className="mb-2 block text-sm font-semibold">Content</label>
                            <textarea id="announcement-content" className={inputClass} rows={8} maxLength={50000} value={form.data.content} onChange={(event) => form.setData('content', event.target.value)} required />
                            {form.errors.content && <p className="mt-1 text-xs text-red-700">{form.errors.content}</p>}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="announcement-category" className="mb-2 block text-sm font-semibold">Category</label>
                                <select id="announcement-category" className={inputClass} value={form.data.category} onChange={(event) => form.setData('category', event.target.value)}>
                                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                                {form.errors.category && <p className="mt-1 text-xs text-red-700">{form.errors.category}</p>}
                            </div>
                            <div>
                                <label htmlFor="announcement-published-at" className="mb-2 block text-sm font-semibold">Published at</label>
                                <input id="announcement-published-at" className={inputClass} type="datetime-local" value={form.data.published_at} onChange={(event) => form.setData('published_at', event.target.value)} />
                                {form.errors.published_at && <p className="mt-1 text-xs text-red-700">{form.errors.published_at}</p>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="announcement-image" className="mb-2 block text-sm font-semibold">Featured image</label>
                            <input id="announcement-image" className={inputClass} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => form.setData('featured_image', event.target.files?.[0] ?? null)} />
                            {announcement?.featuredImageUrl && <img src={announcement.featuredImageUrl} alt="Current announcement" className="mt-3 aspect-[16/9] max-h-56 rounded-xl object-cover" />}
                            {form.errors.featured_image && <p className="mt-1 text-xs text-red-700">{form.errors.featured_image}</p>}
                        </div>
                        <div className="flex flex-wrap justify-between gap-3 border-t border-[#eee7da] pt-5">
                            <Link href="/resort-admin/announcements" className="self-center text-sm font-medium text-[#68766f]">Cancel</Link>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" disabled={form.processing} onClick={() => save('Draft')} className="inline-flex items-center gap-2 rounded-none border border-[#c9d4ca] px-4 py-2.5 text-sm font-semibold text-[#245548] disabled:opacity-50"><Save size={16} /> Save draft</button>
                                <button type="button" disabled={form.processing} onClick={() => save('Published')} className="inline-flex items-center gap-2 rounded-none bg-[#173c34] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><ImagePlus size={16} className="text-[#edbd73]" /> Publish</button>
                            </div>
                        </div>
                        {form.errors.status && <p className="text-xs text-red-700">{form.errors.status}</p>}
                    </form>
                </div>
            </main>
        </>
    );
}
