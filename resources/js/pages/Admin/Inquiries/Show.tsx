import { Head, Link } from '@inertiajs/react';

type Inquiry = {
    id: number;
    message?: string | null;
    status?: string | null;
    contact_information?: string | null;
    user?: { name?: string | null };
    resort?: { name?: string | null };
};

export default function AdminInquiryShow({ inquiry }: { inquiry: Inquiry }) {
    return (
        <>
            <Head title={`Inquiry #${inquiry.id}`} />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(23,60,52,.08)] md:p-8">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                INQUIRY DETAILS
                            </p>
                            <h1 className="mt-2 font-serif text-4xl">
                                Customer inquiry
                            </h1>
                        </div>
                        <Link
                            href="/admin/resort/inquiries"
                            className="text-sm font-semibold text-[#173c34]"
                        >
                            Back
                        </Link>
                    </div>

                    <div className="space-y-5 text-sm text-[#53645d]">
                        <p>
                            <strong className="text-[#173c34]">
                                Customer:
                            </strong>{' '}
                            {inquiry.user?.name || 'Customer'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Resort:</strong>{' '}
                            {inquiry.resort?.name || 'Castañas Resort'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Status:</strong>{' '}
                            {inquiry.status === 'Pending Inquiry'
                                ? 'Pending'
                                : inquiry.status || 'Pending'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Contact:</strong>{' '}
                            {inquiry.contact_information || 'Not provided'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Message:</strong>{' '}
                            {inquiry.message || 'No message provided.'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
