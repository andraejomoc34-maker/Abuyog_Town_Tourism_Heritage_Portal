import { Head, Link } from '@inertiajs/react';

type Review = {
    id: number;
    name: string;
    rating: number;
    message: string;
    status: string;
    created_at: string;
    user?: { name?: string | null } | null;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export default function ResortReviewsIndex({ reviews }: { reviews: Review[] }) {
    return (
        <>
            <Head title="Resort reviews" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-7 flex flex-col gap-4 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Guest experience</p>
                            <h1 className="mt-2 font-serif text-3xl">Resort reviews</h1>
                        </div>
                        <Link href="/resort-admin" className="w-fit rounded-none bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white">Dashboard</Link>
                    </header>

                    {reviews.length === 0 ? (
                        <p className="rounded-[20px] border border-[#e9e0d0] bg-white p-8 text-center text-sm text-[#718078]">No reviews yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <article key={review.id} className="rounded-[20px] border border-[#e9e0d0] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,52,.04)]">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <h2 className="font-semibold">{review.user?.name || review.name}</h2>
                                            <p className="mt-1 text-sm text-[#718078]">{formatDate(review.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-[#bd8b3d]">{review.rating} / 5</span>
                                            <span className="rounded-full bg-[#f8f3e8] px-2.5 py-1 text-xs font-medium text-[#53645d]">{review.status}</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#53645d]">{review.message}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
