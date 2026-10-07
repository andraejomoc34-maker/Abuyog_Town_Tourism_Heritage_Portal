import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Booking = {
    id: number;
    reference_number?: string | null;
    booking_date?: string | null;
    guests?: number | null;
    message?: string | null;
    status?: string | null;
    cottage_quantity?: number | null;
    cottage?: { name?: string | null } | null;
    hotel_room?: { name?: string | null } | null;
    resort?: { name?: string | null };
};

export default function BookingShow({
    booking,
    canLeaveFeedback = false,
    hasReviewed = false,
}: {
    booking: Booking;
    canLeaveFeedback?: boolean;
    hasReviewed?: boolean;
}) {
    const feedbackForm = useForm({ rating: 5, message: '' });

    const submitFeedback = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        feedbackForm.post(`/bookings/${booking.id}/feedback`, { preserveScroll: true });
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
                                Booking #{booking.id}
                            </h1>
                        </div>
                        <Link
                            href="/bookings"
                            className="inline-flex items-center justify-center rounded-md border border-[#173c34] bg-transparent px-4 py-2 text-sm font-semibold text-[#173c34] transition hover:bg-[#173c34] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#173c34] focus:ring-offset-2"
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
                            <strong className="text-[#173c34]">Accommodation:</strong>{' '}
                            {booking.resort?.name || 'Resort'}
                        </p>
                        <p>
                            <strong className="text-[#173c34]">{booking.hotel_room ? 'Room:' : 'Cottage:'}</strong>{' '}
                            {booking.hotel_room?.name || booking.cottage?.name || 'Not assigned'}
                            {booking.cottage && booking.cottage_quantity ? ` · ${booking.cottage_quantity} unit${booking.cottage_quantity === 1 ? '' : 's'}` : ''}
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
                    </div>

                    {canLeaveFeedback && (
                        <form onSubmit={submitFeedback} className="mt-8 border-t border-[#eee7da] pt-6">
                            <h2 className="font-serif text-2xl text-[#173c34]">Review your stay</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
                                <label className="text-sm font-semibold text-[#173c34]">
                                    Rating
                                    <select value={feedbackForm.data.rating} onChange={(event) => feedbackForm.setData('rating', Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-3 py-2.5 font-normal">
                                        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                                    </select>
                                    {feedbackForm.errors.rating && <span className="mt-1 block text-xs text-red-700">{feedbackForm.errors.rating}</span>}
                                </label>
                                <label className="text-sm font-semibold text-[#173c34]">
                                    Comment
                                    <textarea rows={3} maxLength={5000} value={feedbackForm.data.message} onChange={(event) => feedbackForm.setData('message', event.target.value)} className="mt-2 w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-3 py-2.5 font-normal" required />
                                    {feedbackForm.errors.message && <span className="mt-1 block text-xs text-red-700">{feedbackForm.errors.message}</span>}
                                </label>
                            </div>
                            <button type="submit" disabled={feedbackForm.processing} className="mt-4 rounded-none bg-[#173c34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                {feedbackForm.processing ? 'Submitting…' : 'Submit resort review'}
                            </button>
                        </form>
                    )}
                    {hasReviewed && <p className="mt-8 border-t border-[#eee7da] pt-6 text-sm text-[#53645d]">Thank you. Your review has been submitted for this resort.</p>}
                </div>
            </div>
        </>
    );
}
