import { Head, Link } from '@inertiajs/react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type PublicAnnouncement = {
    title: string;
    excerpt: string | null;
    content: string;
    category: string;
    featuredImageUrl: string | null;
    publishedAt: string;
    author: string;
};

export default function AnnouncementShow({
    announcement,
}: {
    announcement: PublicAnnouncement;
}) {
    return (
        <>
            <Head title={announcement.title} />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-10 text-[#173c34] sm:px-8">
                <article className="mx-auto max-w-3xl">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <Link className="text-sm font-medium text-[#245548] underline decoration-[#d99d4b] underline-offset-4" href="/">
                            Back to Abuyog Tourism
                        </Link>
                        <PublicMobileMenu />
                    </div>
                    {announcement.featuredImageUrl && <img alt="" className="mt-6 aspect-[16/9] w-full rounded-lg object-cover" src={announcement.featuredImageUrl} />}
                    <p className="mt-7 text-xs font-bold tracking-[0.18em] text-[#9b6a28] uppercase">{announcement.category}</p>
                    <h1 className="mt-3 font-serif text-3xl font-normal leading-tight sm:text-4xl">{announcement.title}</h1>
                    <p className="mt-4 text-sm text-[#68766f]">
                        {new Date(announcement.publishedAt).toLocaleDateString()} · Posted by {announcement.author}
                    </p>
                    {announcement.excerpt && <p className="mt-7 border-l-2 border-[#d99d4b] pl-4 text-lg leading-7 text-[#53645d]">{announcement.excerpt}</p>}
                    <div className="mt-7 whitespace-pre-wrap text-base leading-8 text-[#465b53]">{announcement.content}</div>
                </article>
            </main>
        </>
    );
}