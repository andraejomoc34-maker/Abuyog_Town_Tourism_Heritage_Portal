import { Head, Link, router } from '@inertiajs/react';

type Booking = {
    id: number;
    reference_number?: string | null;
    booking_date?: string | null;
    guests?: number | null;
    cottage_quantity?: number | null;
    message?: string | null;
    status?: string | null;
    user?: { name?: string | null };
    resort?: { name?: string | null };
    cottage?: { name?: string | null } | null;
};

export default function AdminBookingsIndex({
    bookings,
}: {
    bookings: Booking[];
}) {
    const handleStatusUpdate = (bookingId: number, status: 'Confirmed' | 'Rejected') => {
        router.patch(`/bookings/${bookingId}/status`, { status }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Resort Bookings" />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                BOOKINGS
                            </p>
                            <h1 className="mt-2 font-serif text-4xl">
                                Assigned resort bookings
                            </h1>
                        </div>
                        <Link
                                href="/resort-admin"
                            className="rounded-none bg-[#173c34] px-5 py-3 text-xs font-semibold text-white"
                        >
                            Dashboard
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {bookings.length === 0 && (
                            <p className="rounded-2xl border border-[#e9e0d0] bg-white p-6 text-sm text-[#718078]">No bookings for this resort yet.</p>
                        )}
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="rounded-2xl bg-white p-5 shadow-[0_12px_35px_rgba(31,54,44,.08)]"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                                    <div>
                                        <p className="text-xs font-bold tracking-[0.18em] text-[#bd8b3d] uppercase">
                                            {booking.reference_number || `Booking #${booking.id}`}
                                        </p>
                                        <h2 className="mt-2 font-serif text-2xl text-[#173c34]">
                                            {booking.user?.name || 'Customer'}
                                        </h2>
                                    </div>
                                    <span className="rounded-full bg-[#f7ead1] px-3 py-1 text-xs font-semibold text-[#173c34]">
                                        {booking.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="mt-4 grid gap-3 text-sm text-[#53645d] sm:grid-cols-4">
                                    <p>
                                        <strong>Resort:</strong>{' '}
                                        {booking.resort?.name ||
                                            'Resort'}
                                    </p>
                                    <p>
                                        <strong>Date:</strong>{' '}
                                        {booking.booking_date || 'Not set'}
                                    </p>
                                    <p>
                                        <strong>Guests:</strong>{' '}
                                        {booking.guests || 0}
                                    </p>
                                    <p>
                                        <strong>Cottage:</strong>{' '}
                                        {booking.cottage?.name || 'Not assigned'}
                                        {booking.cottage_quantity ? ` · ${booking.cottage_quantity} unit${booking.cottage_quantity === 1 ? '' : 's'}` : ''}
                                    </p>
                                </div>
                                <p className="mt-3 text-sm text-[#53645d]">
                                    {booking.message ||
                                        'No booking details provided.'}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={`/resort-admin/bookings/${booking.id}`}
                                        className="rounded-none border border-[#d7cdb8] bg-white px-4 py-2 text-xs font-semibold text-[#173c34]"
                                    >
                                        View details
                                    </Link>
                                    {booking.status !== 'Confirmed' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                                            className="rounded-none bg-[#173c34] px-4 py-2 text-xs font-semibold text-white"
                                        >
                                            Confirm
                                        </button>
                                    )}
                                    {booking.status !== 'Rejected' && (
                                        <button
                                            type="button"
                                            onClick={() => handleStatusUpdate(booking.id, 'Rejected')}
                                            className="rounded-none border border-[#d7cdb8] bg-white px-4 py-2 text-xs font-semibold text-[#173c34]"
                                        >
                                            Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
