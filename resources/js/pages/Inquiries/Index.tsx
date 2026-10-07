import { Head, Link } from '@inertiajs/react';

type Inquiry = {
    id: number;
    message?: string | null;
    status?: string | null;
    contact_information?: string | null;
    resort?: { name?: string | null };
};

export default function InquiriesIndex({
    inquiries,
}: {
    inquiries: Inquiry[];
}) {
    return (
        <>
            <Head title="My Inquiries" />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                MY INQUIRIES
                            </p>
                            <h1 className="mt-2 font-serif text-4xl">
                                Your inquiries
                            </h1>
                        </div>
                        <Link
                            href="/resorts"
                            className="rounded-none bg-[#173c34] px-5 py-3 text-xs font-semibold text-white"
                        >
                            Explore Resorts
                        </Link>
                    </div>

                    {inquiries.length === 0 ? (
                        <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_18px_45px_rgba(23,60,52,.08)]">
                            <p className="text-lg font-semibold">
                                You don't have any inquiries yet.
                            </p>
                            <Link
                                href="/resorts"
                                className="mt-5 inline-block rounded-none bg-[#d99d4b] px-5 py-3 text-sm font-semibold text-[#173c34]"
                            >
                                Explore Resorts
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(31,54,44,.08)]"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-xs font-bold tracking-[0.18em] text-[#bd8b3d] uppercase">
                                                {inquiry.resort?.name ||
                                                    'Resort'}
                                            </p>
                                            <h2 className="mt-2 font-serif text-2xl text-[#173c34]">
                                                Inquiry #{inquiry.id}
                                            </h2>
                                        </div>
                                        <span className="rounded-full bg-[#f7ead1] px-3 py-1 text-xs font-semibold text-[#173c34]">
                                            {inquiry.status === 'Pending Inquiry'
                                                ? 'Pending'
                                                : inquiry.status || 'Pending'}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-[#53645d]">
                                        {inquiry.message ||
                                            'No message provided.'}
                                    </p>
                                    <p className="mt-3 text-sm text-[#53645d]">
                                        Contact:{' '}
                                        {inquiry.contact_information ||
                                            'Not provided'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
