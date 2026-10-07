import { Head, Link } from '@inertiajs/react';

type Guest = {
    id: number;
    name: string;
    email: string;
    contact_number?: string | null;
};

type GuestBooking = {
    id: number;
    reference_number?: string | null;
    cottage?: { id: number; name: string } | null;
    booking_date: string;
    guests: number;
    status: string;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

export default function ResortGuestShow({ guest, bookings }: { guest: Guest; bookings: GuestBooking[] }) {
    return (
        <>
            <Head title={`Guest · ${guest.name}`} />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <Link href="/resort-admin/guests" className="text-sm font-semibold text-[#53645d] hover:text-[#173c34]">← All guests</Link>
                    <section className="mt-5 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:p-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Guest record</p>
                        <h1 className="mt-2 font-serif text-3xl">{guest.name}</h1>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">Contact number</p><p className="mt-1 text-sm">{guest.contact_number || 'Not provided'}</p></div>
                            <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#718078]">Email</p><p className="mt-1 break-all text-sm">{guest.email}</p></div>
                        </div>
                    </section>

                    <section className="mt-8">
                        <div className="mb-4 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd8b3d]">Assigned resort only</p>
                                <h2 className="mt-1 font-serif text-2xl">Booking history</h2>
                            </div>
                            <span className="text-sm text-[#718078]">{bookings.length} bookings</span>
                        </div>
                        <div className="overflow-x-auto rounded-[20px] border border-[#e9e0d0] bg-white shadow-[0_8px_24px_rgba(23,60,52,.04)]">
                            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                                <thead className="border-b border-[#e9e0d0] bg-[#fbf8f0] text-xs uppercase tracking-[0.1em] text-[#718078]">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Reference</th>
                                        <th className="px-4 py-3 font-semibold">Cottage</th>
                                        <th className="px-4 py-3 font-semibold">Booking date</th>
                                        <th className="px-4 py-3 font-semibold">Guests</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#efe8dc]">
                                    {bookings.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-[#718078]">No bookings at this resort.</td></tr>
                                    ) : bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-4 py-3"><Link href={`/resort-admin/bookings/${booking.id}`} className="font-semibold text-[#173c34] underline decoration-[#d99d4b] underline-offset-4">{booking.reference_number || `#${booking.id}`}</Link></td>
                                            <td className="px-4 py-3">{booking.cottage?.name || 'Not assigned'}</td>
                                            <td className="px-4 py-3">{formatDate(booking.booking_date)}</td>
                                            <td className="px-4 py-3">{booking.guests}</td>
                                            <td className="px-4 py-3">{booking.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
