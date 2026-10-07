import { Head, Link } from '@inertiajs/react';

type FeedbackEntry = {
    id: number;
    name: string;
    email: string;
    rating: number;
    message: string;
    status: string;
    created_at: string;
};

export default function Feedback({
    feedback,
}: {
    feedback: FeedbackEntry[];
}) {
    return (
        <>
            <Head title="Visitor Feedback" />
            <main className="min-h-screen bg-[#f8f3e8] px-5 py-10 text-[#173c34] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded5c3] pb-6">
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] text-[#9b6a28]">
                                ABUYOG TOURISM
                            </p>
                            <h1 className="mt-2 font-serif text-3xl font-normal sm:text-4xl">
                                Visitor Feedback
                            </h1>
                        </div>
                        <Link
                            className="text-sm font-medium text-[#245548] underline decoration-[#d99d4b] underline-offset-4"
                            href="/dashboard"
                        >
                            Back to dashboard
                        </Link>
                    </div>

                    <p className="mt-6 text-sm text-[#68766f]">
                        {feedback.length} {feedback.length === 1 ? 'response' : 'responses'}
                    </p>

                    {feedback.length === 0 ? (
                        <p className="mt-4 rounded-xl border border-[#e7ddca] bg-white px-5 py-8 text-center text-sm text-[#68766f]">
                            No feedback has been submitted yet.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {feedback.map((entry) => (
                                <li
                                    className="rounded-xl border border-[#e7ddca] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,52,.05)] sm:p-6"
                                    key={entry.id}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold">{entry.name}</h2>
                                            <p className="mt-1 text-sm text-[#68766f]">
                                                {entry.email}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                aria-label={`${entry.rating} out of 5 stars`}
                                                className="text-lg text-[#bd8b3d]"
                                            >
                                                {'\u2605'.repeat(entry.rating)}
                                                <span className="text-[#d9ddd8]">
                                                    {'\u2606'.repeat(5 - entry.rating)}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-xs text-[#68766f]">
                                                {entry.status} ·{' '}
                                                {new Date(entry.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#465b53]">
                                        {entry.message}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </>
    );
}