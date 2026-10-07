import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function InquiryCreate({
    resort,
}: {
    resort: { id: number; name: string; location?: string | null };
}) {
    const [form, setForm] = useState({
        message: '',
        contact_information: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.post(`/resorts/${resort.id}/inquire`, form);
    };

    return (
        <>
            <Head title={`Inquire about ${resort.name}`} />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(23,60,52,.08)] md:p-8">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                INQUIRY FORM
                            </p>
                            <h1 className="mt-2 font-serif text-4xl text-[#173c34]">
                                Send an inquiry
                            </h1>
                        </div>
                        <Link
                            href={`/resorts/${resort.id}`}
                            className="text-sm font-semibold text-[#173c34]"
                        >
                            Back
                        </Link>
                    </div>

                    <div className="mb-8 rounded-2xl bg-[#f7f2e5] p-4">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#bd8b3d] uppercase">
                            Resort
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[#173c34]">
                            {resort.name}
                        </p>
                        <p className="mt-1 text-sm text-[#53645d]">
                            {resort.location || 'Abuyog, Leyte'}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#173c34]">
                                Message
                            </label>
                            <textarea
                                rows={6}
                                value={form.message}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        message: event.target.value,
                                    })
                                }
                                className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b]"
                                placeholder="Ask about available rooms, dates, amenities, or local arrangements."
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#173c34]">
                                Contact information
                            </label>
                            <input
                                type="text"
                                value={form.contact_information}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        contact_information: event.target.value,
                                    })
                                }
                                className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b]"
                                placeholder="Phone, email, or preferred contact channel"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <button
                                type="submit"
                                className="rounded-none bg-[#173c34] px-6 py-3 text-sm font-semibold text-white"
                            >
                                Submit inquiry
                            </button>
                            <Link
                                href={`/resorts/${resort.id}`}
                                className="rounded-none border border-[#d7d2c5] px-6 py-3 text-center text-sm font-semibold text-[#173c34]"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
