import { Head, Link } from '@inertiajs/react';

type GuestSummary = {
    id: number;
    name: string;
    email: string;
    contact_number?: string | null;
    total_bookings: number;
    last_booking?: string | null;
    latest_booking_status?: string | null;
};

const formatDate = (value?: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not available';

export default function ResortGuestsIndex({ guests }: { guests: GuestSummary[] }) {
    return (
        <>
            <Head title="Resort guests" />
            <main className="min-h-screen bg-[#f8f3e8] px-4 py-6 text-[#173c34] sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <header className="mb-7 flex flex-col gap-4 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_12px_32px_rgba(23,60,52,.05)] sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bd8b3d]">Resort operations</p>
                            <h1 className="mt-2 font-serif text-3xl">Guest management</h1>
                            <p className="mt-1 text-sm text-[#718078]">Guest records from bookings at your assigned resort.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-[#718078]">{guests.length} guests</span>
                            <Link href="/resort-admin" className="rounded-none bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white">Dashboard</Link>
                        </div>
                    </header>

                    <div className="space-y-3">
                        {guests.length === 0 && (
                            <p className="rounded-2xl border border-[#e9e0d0] bg-white p-8 text-center text-sm text-[#718078]">No guests have booked this resort yet.</p>
                        )}
                        {guests.map((guest) => (
                            <article key={guest.id} className="grid gap-4 rounded-[20px] border border-[#e9e0d0] bg-white p-5 shadow-[0_8px_24px_rgba(23,60,52,.04)] md:grid-cols-[1.2fr_1.2fr_0.7fr_1fr_auto] md:items-center">
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">{guest.name}</p>
                                    <p className="mt-1 truncate text-sm text-[#718078]">{guest.email}</p>
                                </div>
                                <p className="text-sm text-[#53645d]">{guest.contact_number || 'No contact number'}</p>
                                <div>
                                    <p className="text-xs text-[#718078]">Bookings</p>
                                    <p className="mt-1 font-semibold">{guest.total_bookings}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#718078]">Last booking · {guest.latest_booking_status || 'Unknown'}</p>
                                    <p className="mt-1 text-sm font-semibold">{formatDate(guest.last_booking)}</p>
                                </div>
                                <Link href={`/resort-admin/guests/${guest.id}`} className="inline-flex justify-center rounded-none border border-[#d7cdb8] px-4 py-2 text-xs font-semibold hover:bg-[#f8f3e8]">View guest</Link>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
