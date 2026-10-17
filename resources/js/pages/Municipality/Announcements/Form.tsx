import { ArrowLeft, ImagePlus, Send, Save } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import MultipleImageUpload, { type ExistingContentImage } from '../../../components/MultipleImageUpload';

type AnnouncementDraft = {
    id: number;
    title: string;
    excerpt: string | null;
    content: string;
    featuredImageUrl: string | null;
    images: { id: number; url: string }[];
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    publishedAt: string | null;
    eventStartDate?: string | null;
    eventEndDate?: string | null;
    eventStartTime?: string | null;
    eventVenue?: string | null;
    eventOrganizer?: string | null;
    eventContactInformation?: string | null;
    eventSourceUrl?: string | null;
    eventDateStatus?: 'Confirmed' | 'Tentative' | 'Unverified';
};

type FormData = {
    title: string;
    excerpt: string;
    content: string;
    images: File[];
    remove_image_ids: number[];
    remove_featured_image: boolean;
    category: string;
    status: 'Draft' | 'Published' | 'Archived';
    published_at: string;
    event_start_date: string;
    event_end_date: string;
    event_start_time: string;
    event_venue: string;
    event_organizer: string;
    event_contact_information: string;
    event_source_url: string;
    event_date_status: 'Confirmed' | 'Tentative' | 'Unverified';
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
        images: [],
        remove_image_ids: [],
        remove_featured_image: false,
        category: announcement?.category ?? categories[0] ?? 'Official Announcement',
        status: announcement?.status ?? 'Draft',
        published_at: announcement?.publishedAt ?? '',
        event_start_date: announcement?.eventStartDate ?? '',
        event_end_date: announcement?.eventEndDate ?? '',
        event_start_time: announcement?.eventStartTime ?? '',
        event_venue: announcement?.eventVenue ?? '',
        event_organizer: announcement?.eventOrganizer ?? '',
        event_contact_information: announcement?.eventContactInformation ?? '',
        event_source_url: announcement?.eventSourceUrl ?? '',
        event_date_status: announcement?.eventDateStatus ?? 'Unverified',
    });
    const isEvent = ['Event', 'Festival'].includes(form.data.category);
    const existingImages: ExistingContentImage[] = [
        ...(announcement?.featuredImageUrl && !form.data.remove_featured_image
            ? [{ id: null, url: announcement.featuredImageUrl, label: 'Current cover image' }]
            : []),
        ...(announcement?.images ?? [])
            .filter((image) => !form.data.remove_image_ids.includes(image.id))
            .map((image) => ({ ...image, label: 'Current gallery image' })),
    ];

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

                        {isEvent && (
                            <fieldset className="space-y-5 rounded-lg border border-[#e5ddce] bg-[#fbf8f0] p-4 sm:p-5">
                                <legend className="px-2 text-sm font-semibold text-[#173c34]">Event details</legend>
                                <p className="text-xs leading-5 text-[#68766f]">
                                    Event dates are separate from the announcement publication date. Published events need a start date. Mark recurring dates tentative or unverified until an official date is confirmed.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-start-date">Start date</label>
                                        <input className={fieldClass} id="event-start-date" type="date" onChange={(event) => form.setData('event_start_date', event.target.value)} value={form.data.event_start_date} />
                                        {form.errors.event_start_date && <p className="mt-1 text-xs text-red-700">{form.errors.event_start_date}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-end-date">End date (optional)</label>
                                        <input className={fieldClass} id="event-end-date" type="date" min={form.data.event_start_date || undefined} onChange={(event) => form.setData('event_end_date', event.target.value)} value={form.data.event_end_date} />
                                        {form.errors.event_end_date && <p className="mt-1 text-xs text-red-700">{form.errors.event_end_date}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-start-time">Start time (Philippine time)</label>
                                        <input className={fieldClass} id="event-start-time" type="time" onChange={(event) => form.setData('event_start_time', event.target.value)} value={form.data.event_start_time} />
                                        {form.errors.event_start_time && <p className="mt-1 text-xs text-red-700">{form.errors.event_start_time}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-date-status">Date confirmation</label>
                                        <select className={fieldClass} id="event-date-status" onChange={(event) => form.setData('event_date_status', event.target.value as FormData['event_date_status'])} value={form.data.event_date_status}>
                                            <option value="Unverified">Unverified</option>
                                            <option value="Tentative">Tentative</option>
                                            <option value="Confirmed">Confirmed</option>
                                        </select>
                                        {form.errors.event_date_status && <p className="mt-1 text-xs text-red-700">{form.errors.event_date_status}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-venue">Venue (optional)</label>
                                        <input className={fieldClass} id="event-venue" maxLength={255} onChange={(event) => form.setData('event_venue', event.target.value)} value={form.data.event_venue} />
                                        {form.errors.event_venue && <p className="mt-1 text-xs text-red-700">{form.errors.event_venue}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-organizer">Organizer (optional)</label>
                                        <input className={fieldClass} id="event-organizer" maxLength={255} onChange={(event) => form.setData('event_organizer', event.target.value)} value={form.data.event_organizer} />
                                        {form.errors.event_organizer && <p className="mt-1 text-xs text-red-700">{form.errors.event_organizer}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-contact">Contact information (optional)</label>
                                        <textarea className={`${fieldClass} min-h-20 resize-y`} id="event-contact" maxLength={2000} onChange={(event) => form.setData('event_contact_information', event.target.value)} value={form.data.event_contact_information} />
                                        {form.errors.event_contact_information && <p className="mt-1 text-xs text-red-700">{form.errors.event_contact_information}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium" htmlFor="event-source-url">Official source link (optional)</label>
                                        <input className={fieldClass} id="event-source-url" type="url" onChange={(event) => form.setData('event_source_url', event.target.value)} value={form.data.event_source_url} />
                                        {form.errors.event_source_url && <p className="mt-1 text-xs text-red-700">{form.errors.event_source_url}</p>}
                                    </div>
                                </div>
                            </fieldset>
                        )}

                        <MultipleImageUpload
                            id="announcement-gallery-images"
                            files={form.data.images}
                            existingImages={existingImages}
                            errors={form.errors}
                            progress={form.progress?.percentage}
                            onFilesChange={(files) => form.setData('images', files)}
                            onRemoveExisting={(image) => {
                                if (image.id === null) {
                                    form.setData('remove_featured_image', true);
                                } else {
                                    form.setData('remove_image_ids', [...form.data.remove_image_ids, image.id]);
                                }
                            }}
                        />

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