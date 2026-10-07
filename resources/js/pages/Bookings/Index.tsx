import { Head, Link } from '@inertiajs/react';
import AuthenticatedNavigation from '../../components/AuthenticatedNavigation';

type Booking = {
    id: number;
    reference_number?: string | null;
    booking_date?: string | null;
    guests?: number | null;
    cottage_quantity?: number | null;
    status?: string | null;
    resort?: { name?: string | null } | null;
    cottage?: { name?: string | null } | null;
    hotel_room?: { name?: string | null } | null;
};

const statusStyle: Record<string, string> = {
    Pending: 'bg-[#fef3c7] text-[#854d0e]',
    Confirmed: 'bg-[#dcfce7] text-[#166534]',
    Rejected: 'bg-[#fee2e2] text-[#991b1b]',
    Cancelled: 'bg-[#e5e7eb] text-[#374151]',
    Completed: 'bg-[#dbeafe] text-[#1d4ed8]',
};

const formatDate = (value?: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date not set';

export default function MyBookingsIndex({ bookings }: { bookings: Booking[] }) {
    return (
        <>
            <Head title="My Bookings" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <AuthenticatedNavigation />
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
                    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd8b3d]">Your travel plans</p>
                            <h1 className="mt-2 font-serif text-3xl sm:text-4xl">My bookings</h1>
                        </div>
                        <Link href="/resorts" className="inline-flex min-h-11 items-center justify-center rounded-none bg-[#173c34] px-5 text-sm font-semibold text-white">Explore resorts</Link>
                    </header>

                    {bookings.length === 0 ? (
                        <section className="rounded-2xl border border-[#e9e0d0] bg-white p-6 text-center sm:p-10">
                            <h2 className="font-serif text-2xl">No bookings yet</h2>
                            <p className="mt-2 text-sm text-[#718078]">Your resort bookings will appear here.</p>
                            <Link href="/resorts" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-none bg-[#d99d4b] px-5 text-sm font-semibold text-[#173c34]">Browse resorts</Link>
                        </section>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <article key={booking.id} className="rounded-2xl border border-[#e9e0d0] bg-white p-5 shadow-[0_10px_28px_rgba(23,60,52,.05)] sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="break-all text-xs font-bold uppercase tracking-[0.12em] text-[#bd8b3d]">{booking.reference_number || `Booking #${booking.id}`}</p>
                                            <h2 className="mt-2 break-words font-serif text-2xl">{booking.resort?.name || 'Resort'}</h2>
                                        </div>
                                        <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[booking.status ?? 'Pending'] ?? 'bg-[#f1f5f9] text-[#475569]'}`}>{booking.status || 'Pending'}</span>
                                    </div>
                                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-4">
                                        <div><dt className="text-xs text-[#718078]">{booking.hotel_room ? 'Room' : 'Cottage'}</dt><dd className="mt-1 break-words font-medium">{booking.hotel_room?.name || booking.cottage?.name || 'Not assigned'}</dd></div>
                                        <div><dt className="text-xs text-[#718078]">Date</dt><dd className="mt-1 font-medium">{formatDate(booking.booking_date)}</dd></div>
                                        <div><dt className="text-xs text-[#718078]">Guests</dt><dd className="mt-1 font-medium">{booking.guests ?? 0}</dd></div>
                                        <div><dt className="text-xs text-[#718078]">Units</dt><dd className="mt-1 font-medium">{booking.cottage_quantity ?? 1}</dd></div>
                                    </dl>
                                    <div className="mt-5 border-t border-[#eee7da] pt-4">
                                        <Link href={`/bookings/${booking.id}`} className="inline-flex min-h-10 items-center rounded-none border border-[#d7cdb8] px-4 text-sm font-semibold text-[#173c34] hover:bg-[#f8f3e8]">View booking</Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
