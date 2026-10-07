import { Head, Link } from '@inertiajs/react';

type Inquiry = {
    id: number;
    message?: string | null;
    status?: string | null;
    contact_information?: string | null;
    user?: { name?: string | null };
    resort?: { name?: string | null };
};

export default function AdminInquiriesIndex({
    inquiries,
}: {
    inquiries: Inquiry[];
}) {
    return (
        <>
            <Head title="Resort Inquiries" />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                INQUIRIES
                            </p>
                            <h1 className="mt-2 font-serif text-4xl">
                                Assigned resort inquiries
                            </h1>
                        </div>
                        <Link
                            href="/admin/resort/dashboard"
                            className="rounded-none bg-[#173c34] px-5 py-3 text-xs font-semibold text-white"
                        >
                            Dashboard
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                            <div
                                key={inquiry.id}
                                className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(31,54,44,.08)]"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.18em] text-[#bd8b3d] uppercase">
                                            Inquiry #{inquiry.id}
                                        </p>
                                        <h2 className="mt-2 font-serif text-2xl text-[#173c34]">
                                            {inquiry.user?.name || 'Customer'}
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
                                        'No inquiry message provided.'}
                                </p>
                                <div className="mt-3 grid gap-3 text-sm text-[#53645d] sm:grid-cols-2">
                                    <p>
                                        <strong>Resort:</strong>{' '}
                                        {inquiry.resort?.name ||
                                            'Castañas Resort'}
                                    </p>
                                    <p>
                                        <strong>Contact:</strong>{' '}
                                        {inquiry.contact_information ||
                                            'Not provided'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
