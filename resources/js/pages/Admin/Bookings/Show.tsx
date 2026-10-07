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

export default function AdminBookingShow({ booking }: { booking: Booking }) {
    const handleStatusUpdate = (status: 'Confirmed' | 'Rejected') => {
        router.patch(`/bookings/${booking.id}/status`, { status }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`Booking #${booking.id}`} />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(23,60,52,.08)] md:p-8">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                BOOKING DETAILS
                            </p>
                            <h1 className="mt-2 font-serif text-4xl">
                                Customer booking
                            </h1>
                        </div>
                        <Link
                            href="/resort-admin/bookings"
                            className="text-sm font-semibold text-[#173c34]"
                        >
                            Back
                        </Link>
                    </div>

                    <div className="space-y-5 text-sm text-[#53645d]">
                        <p>
                            <strong className="text-[#173c34]">Reference Number:</strong>{' '}
                            {booking.reference_number || 'Not assigned'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">
                                Customer:
                            </strong>{' '}
                            {booking.user?.name || 'Customer'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Resort:</strong>{' '}
                            {booking.resort?.name || 'Resort'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Cottage:</strong>{' '}
                            {booking.cottage?.name || 'Not assigned'}
                            {booking.cottage_quantity ? ` · ${booking.cottage_quantity} unit${booking.cottage_quantity === 1 ? '' : 's'}` : ''}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Date:</strong>{' '}
                            {booking.booking_date || 'Not set'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Guests:</strong>{' '}
                            {booking.guests || 0}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Status:</strong>{' '}
                            {booking.status || 'Pending'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">Message:</strong>{' '}
                            {booking.message || 'No message provided.'}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            {booking.status !== 'Confirmed' && (
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('Confirmed')}
                                    className="rounded-none bg-[#173c34] px-4 py-2 text-xs font-semibold text-white"
                                >
                                    Confirm booking
                                </button>
                            )}
                            {booking.status !== 'Rejected' && (
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate('Rejected')}
                                    className="rounded-none border border-[#d7cdb8] bg-white px-4 py-2 text-xs font-semibold text-[#173c34]"
                                >
                                    Reject booking
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
