import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type CottageOption = {
    id: number;
    name: string;
    description?: string | null;
    capacity: number;
    quantity: number;
    price?: string | number | null;
};

type HotelRoomOption = {
    id: number;
    name: string;
    room_type: string;
    description?: string | null;
    capacity?: number | null;
    price?: number | string | null;
    available_quantity: number;
    image?: string | null;
};

export default function BookingCreate({
    resort,
    user,
    cottages,
    rooms = [],
    propertyType = 'resort',
}: {
    resort: { id: number; name: string; location?: string | null; image?: string | null; image_url?: string | null };
    user?: { name?: string | null; email?: string | null };
    cottages: CottageOption[];
    rooms?: HotelRoomOption[];
    propertyType?: 'hotel' | 'resort';
}) {
    const isHotel = propertyType === 'hotel';
    const form = useForm({
        cottage_id: cottages[0] ? String(cottages[0].id) : '',
        room_id: rooms[0] ? String(rooms[0].id) : '',
        booking_date: '',
        guests: 2,
        quantity: 1,
        message: '',
    });
    const authUser = usePage<{ auth?: { user?: { name?: string | null; email?: string | null } } }>().props.auth?.user ?? user;
    const selectedCottage = cottages.find((cottage) => String(cottage.id) === form.data.cottage_id);
    const selectedRoom = rooms.find((room) => String(room.id) === form.data.room_id);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/resorts/${resort.id}/book`);
    };

    return (
        <>
            <Head title={`Book ${resort.name}`} />
            <div className="min-h-screen bg-[#fbf8f0] px-6 py-12 text-[#173c34] lg:px-10">
                <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(23,60,52,.08)] md:p-8">
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                BOOKING FORM
                            </p>
                            <h1 className="mt-2 font-serif text-4xl text-[#173c34]">
                                Book your stay
                            </h1>
                        </div>
                        <Link
                            href={`/resorts/${resort.id}`}
                            className="text-sm font-semibold text-[#173c34]"
                        >
                            Back
                        </Link>
                    </div>

                    <div className="mb-8 overflow-hidden rounded-2xl bg-[#f7f2e5] p-4">
                        <img
                            src={resort.image_url || resort.image || '/island-paradise-3.jpg'}
                            alt={resort.name}
                            className="mb-4 h-48 w-full rounded-xl object-cover"
                        />
                        <p className="text-xs font-bold tracking-[0.18em] text-[#bd8b3d] uppercase">
                            {isHotel ? 'HOTEL' : 'RESORT'}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-[#173c34]">
                            {resort.name}
                        </p>
                        <p className="mt-1 text-sm text-[#53645d]">
                            {resort.location || 'Abuyog, Leyte'}
                        </p>
                    </div>

                    <div className="mb-6 rounded-2xl border border-[#e8dec5] bg-[#fffdf8] p-4 text-sm text-[#53645d]">
                        <p><strong className="text-[#173c34]">Customer Name:</strong> {authUser?.name || 'Guest User'}</p>
                        <p className="mt-2"><strong className="text-[#173c34]">Email:</strong> {authUser?.email || 'Not available'}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor={isHotel ? 'room_id' : 'cottage_id'} className="mb-2 block text-sm font-semibold text-[#173c34]">
                                {isHotel ? 'Room' : 'Cottage'}
                            </label>
                            {isHotel ? (
                                <>
                                    <select
                                        id="room_id"
                                        value={form.data.room_id}
                                        onChange={(event) => form.setData('room_id', event.target.value)}
                                        disabled={rooms.length === 0}
                                        className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b] disabled:opacity-60"
                                        required
                                    >
                                        {rooms.map((room) => (
                                            <option key={room.id} value={room.id}>
                                                {room.name} · {room.available_quantity} available
                                            </option>
                                        ))}
                                    </select>
                                    {selectedRoom && (
                                        <p className="mt-2 text-sm text-[#53645d]">
                                            Capacity: {selectedRoom.capacity ?? 'Not listed'}
                                            {selectedRoom.price != null && ` · Listed price ₱${Number(selectedRoom.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                        </p>
                                    )}
                                    {form.errors.room_id && <p className="mt-1 text-sm text-red-700">{form.errors.room_id}</p>}
                                    {rooms.length === 0 && <p className="mt-2 text-sm text-red-700">No hotel rooms are currently available for booking.</p>}
                                </>
                            ) : (
                                <>
                                    <select
                                        id="cottage_id"
                                        value={form.data.cottage_id}
                                        onChange={(event) => {
                                            const cottage = cottages.find((item) => String(item.id) === event.target.value);
                                            form.setData((data) => ({
                                                ...data,
                                                cottage_id: event.target.value,
                                                quantity: 1,
                                                guests: cottage ? Math.min(data.guests, cottage.capacity) : data.guests,
                                            }));
                                        }}
                                        disabled={cottages.length === 0}
                                        className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b] disabled:opacity-60"
                                        required
                                    >
                                        {cottages.map((cottage) => (
                                            <option key={cottage.id} value={cottage.id}>
                                                {cottage.name} · {cottage.capacity} guests · {cottage.quantity} available
                                            </option>
                                        ))}
                                    </select>
                                    {selectedCottage && (
                                        <p className="mt-2 text-sm text-[#53645d]">
                                            {selectedCottage.description || 'Cottage inventory'}
                                            {selectedCottage.price != null && ` · PHP ${Number(selectedCottage.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
                                        </p>
                                    )}
                                    {form.errors.cottage_id && <p className="mt-1 text-sm text-red-700">{form.errors.cottage_id}</p>}
                                    {cottages.length === 0 && <p className="mt-2 text-sm text-red-700">No cottages are currently available for booking.</p>}
                                </>
                            )}
                        </div>

                        <div>
                            <label htmlFor="booking_date" className="mb-2 block text-sm font-semibold text-[#173c34]">
                                Booking date
                            </label>
                            <input
                                id="booking_date"
                                type="date"
                                min={new Date().toISOString().slice(0, 10)}
                                value={form.data.booking_date}
                                onChange={(event) => form.setData('booking_date', event.target.value)}
                                className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] ring-0 outline-none focus:border-[#d99d4b]"
                                required
                            />
                            {form.errors.booking_date && <p className="mt-1 text-sm text-red-700">{form.errors.booking_date}</p>}
                        </div>

                        <div className={`grid gap-5 ${isHotel ? '' : 'sm:grid-cols-2'}`}>
                            <div>
                            <label htmlFor="guests" className="mb-2 block text-sm font-semibold text-[#173c34]">
                                Number of guests
                            </label>
                            <input
                                id="guests"
                                type="number"
                                min={1}
                                max={isHotel ? (selectedRoom?.capacity ?? 500) : (selectedCottage?.capacity ?? 500)}
                                value={form.data.guests}
                                onChange={(event) => form.setData('guests', Number(event.target.value))}
                                className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b]"
                                required
                            />
                                {form.errors.guests && <p className="mt-1 text-sm text-red-700">{form.errors.guests}</p>}
                            </div>
                            {!isHotel && <div>
                                <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-[#173c34]">Cottages to book</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={selectedCottage?.quantity ?? 1}
                                    value={form.data.quantity}
                                    onChange={(event) => form.setData('quantity', Number(event.target.value))}
                                    className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b]"
                                    required
                                />
                                {form.errors.quantity && <p className="mt-1 text-sm text-red-700">{form.errors.quantity}</p>}
                            </div>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#173c34]">
                                Message / special request
                            </label>
                            <textarea
                                rows={5}
                                value={form.data.message}
                                onChange={(event) => form.setData('message', event.target.value)}
                                className="w-full rounded-xl border border-[#dcd2c0] bg-[#fffdf8] px-4 py-3 text-[#173c34] outline-none focus:border-[#d99d4b]"
                                placeholder="Tell us about your preferred dates or any accommodation requests."
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                            <button
                                type="submit"
                                disabled={form.processing || (isHotel ? rooms.length === 0 : cottages.length === 0)}
                                className="rounded-none bg-[#d99d4b] px-6 py-3 text-sm font-semibold text-[#173c34] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {form.processing ? 'Submitting...' : 'Submit booking'}
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
