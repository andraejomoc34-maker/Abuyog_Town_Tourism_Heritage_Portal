import { ArrowLeft, ImagePlus, Send, Save } from 'lucide-react';
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

type FormData = {
    title: string;
    excerpt: string;
    content: string;
    featured_image: File | null;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    published_at: string;
};

const fieldClass = 'w-full rounded-md border border-[#dcd5c8] bg-white px-3.5 py-3 text-sm text-[#173c34] outline-none transition focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20';

export default function AnnouncementForm({
    announcement,
    categories,
    baseUrl,
}: {
    announcement: AnnouncementDraft | null;
    categories: string[];
    baseUrl: string;
}) {
    const form = useForm<FormData>({
        title: announcement?.title ?? '',
        excerpt: announcement?.excerpt ?? '',
        content: announcement?.content ?? '',
        featured_image: null,
        category: announcement?.category ?? categories[0] ?? 'Official Announcement',
        status: announcement?.status ?? 'Draft',
        published_at: announcement?.publishedAt ?? '',
    });

    function save(status: FormData['status']) {
        form.transform((data) => ({ ...data, status }));

        if (announcement) {
            form.put(`${baseUrl}/${announcement.id}`);
        } else {
            form.post(baseUrl);
        }
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        save(form.data.status);
    }

    return (
        <>
            <Head title={announcement ? 'Edit Announcement' : 'Create Announcement'} />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-8 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#53645d] hover:text-[#173c34]" href={baseUrl}>
                        <ArrowLeft className="h-4 w-4" />
                        Announcements
                    </Link>
                    <div className="mt-5 border-b border-[#ded7c8] pb-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL TOURISM OFFICE</p>
                        <h1 className="mt-2 font-serif text-3xl font-normal">{announcement ? 'Edit Announcement' : 'Create Announcement'}</h1>
                    </div>

                    <form className="mt-6 space-y-5 rounded-lg border border-[#e5ddce] bg-white p-5 sm:p-7" onSubmit={submit}>
                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="announcement-title">Announcement Title</label>
                            <input className={fieldClass} id="announcement-title" onChange={(event) => form.setData('title', event.target.value)} value={form.data.title} />
                            {form.errors.title && <p className="mt-1 text-xs text-red-700">{form.errors.title}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="announcement-excerpt">Short Description</label>
                            <textarea className={`${fieldClass} min-h-20 resize-y`} id="announcement-excerpt" maxLength={500} onChange={(event) => form.setData('excerpt', event.target.value)} value={form.data.excerpt} />
                            {form.errors.excerpt && <p className="mt-1 text-xs text-red-700">{form.errors.excerpt}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="announcement-content">Full Content</label>
                            <textarea className={`${fieldClass} min-h-56 resize-y leading-6`} id="announcement-content" onChange={(event) => form.setData('content', event.target.value)} value={form.data.content} />
                            {form.errors.content && <p className="mt-1 text-xs text-red-700">{form.errors.content}</p>}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium" htmlFor="announcement-category">Category</label>
                                <select className={fieldClass} id="announcement-category" onChange={(event) => form.setData('category', event.target.value)} value={form.data.category}>
                                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                                </select>
                                {form.errors.category && <p className="mt-1 text-xs text-red-700">{form.errors.category}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium" htmlFor="announcement-published-at">Publication Date</label>
                                <input className={fieldClass} id="announcement-published-at" onChange={(event) => form.setData('published_at', event.target.value)} type="datetime-local" value={form.data.published_at} />
                                {form.errors.published_at && <p className="mt-1 text-xs text-red-700">{form.errors.published_at}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium" htmlFor="announcement-image">Featured Image</label>
                            <input accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-3 file:rounded-sm file:border-0 file:bg-[#f4f1e8] file:px-3 file:py-2`} id="announcement-image" onChange={(event) => form.setData('featured_image', event.target.files?.[0] ?? null)} type="file" />
                            {announcement?.featuredImageUrl && <img alt="Current announcement feature" className="mt-3 aspect-[16/9] max-h-56 rounded-md object-cover" src={announcement.featuredImageUrl} />}
                            {form.errors.featured_image && <p className="mt-1 text-xs text-red-700">{form.errors.featured_image}</p>}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee7da] pt-5">
                            <Link className="text-sm font-medium text-[#68766f] hover:text-[#173c34]" href={baseUrl}>Cancel</Link>
                            <div className="flex flex-wrap gap-2">
                                <button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#c9d4ca] px-4 text-sm font-semibold text-[#245548] hover:bg-[#f4f8f3] disabled:opacity-50" disabled={form.processing} onClick={() => save('Draft')} type="button">
                                    <Save className="h-4 w-4" />
                                    Save Draft
                                </button>
                                <button className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white hover:bg-[#245548] disabled:opacity-50" disabled={form.processing} onClick={() => save('Published')} type="button">
                                    <ImagePlus className="h-4 w-4 text-[#edbd73]" />
                                    Publish Announcement
                                </button>
                            </div>
                        </div>
                        {form.errors.status && <p className="text-xs text-red-700">{form.errors.status}</p>}
                    </form>
                </div>
            </main>
        </>
    );
}