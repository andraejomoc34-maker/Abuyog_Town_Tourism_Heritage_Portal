import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BedDouble,
    CalendarDays,
    ChartNoAxesColumnIncreasing,
    ClipboardList,
    DoorOpen,
    Hotel as HotelIcon,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    UserRound,
    UsersRound,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Section = 'dashboard' | 'bookings' | 'calendar' | 'rooms' | 'guests' | 'reports' | 'profile' | 'settings';
type Hotel = {
    id: number;
    name: string;
    location?: string | null;
    description?: string | null;
    contact_information?: string | null;
    price_information?: string | null;
};
type Room = {
    id: number;
    name: string;
    room_type: string;
    description?: string | null;
    capacity?: number | null;
    price?: string | number | null;
    available_quantity: number;
    status: 'Available' | 'Maintenance' | 'Unavailable';
    image?: string | null;
};
type Booking = {
    id: number;
    reference_number?: string | null;
    booking_date?: string | null;
    guests: number;
    status: string;
    message?: string | null;
    user?: { name?: string; email?: string; contact_number?: string | null } | null;
    hotel_room?: { name?: string } | null;
};

const navItems: { label: string; href: string; section: Section }[] = [
    { label: 'Dashboard', href: '/hotel-admin', section: 'dashboard' },
    { label: 'Bookings', href: '/hotel-admin/bookings', section: 'bookings' },
    { label: 'Calendar', href: '/hotel-admin/calendar', section: 'calendar' },
    { label: 'Rooms', href: '/hotel-admin/rooms', section: 'rooms' },
    { label: 'Guests', href: '/hotel-admin/guests', section: 'guests' },
    { label: 'Reports', href: '/hotel-admin/reports', section: 'reports' },
    { label: 'Hotel Profile', href: '/hotel-admin/profile', section: 'profile' },
    { label: 'Settings', href: '/hotel-admin/settings', section: 'settings' },
];

const navIcons: Record<Section, LucideIcon> = {
    dashboard: LayoutDashboard,
    bookings: ClipboardList,
    calendar: CalendarDays,
    rooms: BedDouble,
    guests: UsersRound,
    reports: ChartNoAxesColumnIncreasing,
    profile: HotelIcon,
    settings: Settings,
};

const statusClasses: Record<string, string> = {
    Pending: 'bg-[#fbf1dc] text-[#815516] ring-1 ring-inset ring-[#d99d4b]/25',
    Confirmed: 'bg-[#e6f0e8] text-[#315d3c] ring-1 ring-inset ring-[#315d3c]/15',
    Rejected: 'bg-[#f7e8e5] text-[#91463c] ring-1 ring-inset ring-[#91463c]/15',
    Cancelled: 'bg-[#ecefeb] text-[#53645d] ring-1 ring-inset ring-[#53645d]/15',
    Completed: 'bg-[#e8edf1] text-[#39566b] ring-1 ring-inset ring-[#39566b]/15',
};

const roomStatusClasses: Record<Room['status'], string> = {
    Available: 'bg-[#e6f0e8] text-[#315d3c]',
    Maintenance: 'bg-[#fbf1dc] text-[#815516]',
    Unavailable: 'bg-[#ecefeb] text-[#53645d]',
};

const formFieldClasses = 'mt-1 w-full rounded-none border border-[#dcd2c0] bg-white px-3 py-2 text-[#173c34] transition focus:border-[#d99d4b] focus:outline-none focus:ring-2 focus:ring-[#d99d4b]/20';

const formatDate = (value?: string | null) => value
    ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not set';

const getCalendarCells = (month: string) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNumber - 1, 1);
    const dayCount = new Date(year, monthNumber, 0).getDate();
    const count = Math.ceil((firstDay.getDay() + dayCount) / 7) * 7;

    return Array.from({ length: count }, (_, index) => {
        const date = new Date(year, monthNumber - 1, index - firstDay.getDay() + 1);

        return {
            date,
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            inMonth: date.getMonth() === monthNumber - 1,
        };
    });
};

function RoomEditor({ room }: { room: Room }) {
    const form = useForm({
        name: room.name,
        room_type: room.room_type,
        description: room.description ?? '',
        capacity: room.capacity?.toString() ?? '',
        price: room.price?.toString() ?? '',
        available_quantity: room.available_quantity,
        status: room.status,
        image: room.image ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/hotel-admin/rooms/${room.id}`, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)]">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-xl font-semibold text-[#173c34]">{room.name}</h3>
                    <span className={`mt-2 inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold ${roomStatusClasses[room.status]}`}>{room.status}</span>
                </div>
                {room.image && <img src={room.image} alt="" className="h-16 w-20 rounded-lg object-cover" />}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Room name
                    <input value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className={formFieldClasses} required />
                </label>
                <label className="text-sm font-medium">Room type
                    <input value={form.data.room_type} onChange={(event) => form.setData('room_type', event.target.value)} className={formFieldClasses} required />
                </label>
                <label className="text-sm font-medium">Capacity (leave blank if unverified)
                    <input type="number" min="1" value={form.data.capacity} onChange={(event) => form.setData('capacity', event.target.value)} className={formFieldClasses} />
                    {form.errors.capacity && <span className="mt-1 block text-xs text-rose-700">{form.errors.capacity}</span>}
                </label>
                <label className="text-sm font-medium">Price (PHP)
                    <input type="number" min="0" step="0.01" value={form.data.price} onChange={(event) => form.setData('price', event.target.value)} className={formFieldClasses} />
                    {form.errors.price && <span className="mt-1 block text-xs text-rose-700">{form.errors.price}</span>}
                </label>
                <label className="text-sm font-medium">Room quantity
                    <input type="number" min="0" value={form.data.available_quantity} onChange={(event) => form.setData('available_quantity', Number(event.target.value))} className={formFieldClasses} required />
                    {form.errors.available_quantity && <span className="mt-1 block text-xs text-rose-700">{form.errors.available_quantity}</span>}
                </label>
                <label className="text-sm font-medium">Status
                    <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value as Room['status'])} className={formFieldClasses}>
                        <option>Available</option>
                        <option>Maintenance</option>
                        <option>Unavailable</option>
                    </select>
                </label>
                <label className="text-sm font-medium sm:col-span-2">Description
                    <textarea rows={2} value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} className={formFieldClasses} />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Image path
                    <input value={form.data.image} onChange={(event) => form.setData('image', event.target.value)} className={formFieldClasses} />
                </label>
            </div>
            <button disabled={form.processing} className="mt-4 rounded-none bg-[#173c34] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                Save room
            </button>
        </form>
    );
}

export default function HotelDashboard({
    user,
    hotel,
    section,
    stats,
    bookings,
    selectedBooking,
    calendarMonth,
    calendarBookings,
    rooms,
    guestBookings,
    bookingTrends,
}: {
    user: { name: string };
    hotel: Hotel;
    section: Section;
    stats: { totalBookings: number; pendingBookings: number; confirmedBookings: number; rejectedBookings: number; totalGuests: number; availableRooms: number; roomOccupancy: number };
    bookings: Booking[];
    selectedBooking?: Booking | null;
    calendarMonth: string;
    calendarBookings: Booking[];
    rooms: Room[];
    guestBookings: Booking[];
    bookingTrends: { month: string; bookings: number }[];
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const settingsForm = useForm({
        name: hotel.name,
        location: hotel.location ?? '',
        description: hotel.description ?? '',
        contact_information: hotel.contact_information ?? '',
        price_information: hotel.price_information ?? '',
    });
    const newRoomForm = useForm({
        name: '',
        room_type: '',
        description: '',
        capacity: '',
        price: '',
        available_quantity: 0,
        status: 'Unavailable',
        image: '',
    });
    const calendarCells = getCalendarCells(calendarMonth);
    const today = new Date();
    const currentCalendarDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const bookingsByDate = new Map<string, Booking[]>();
    calendarBookings.forEach((booking) => {
        const date = String(booking.booking_date ?? '').slice(0, 10);
        bookingsByDate.set(date, [...(bookingsByDate.get(date) ?? []), booking]);
    });
    const title = navItems.find((item) => item.section === section)?.label ?? 'Dashboard';
    const dashboardStats: { label: string; value: number; Icon: LucideIcon }[] = [
        { label: 'Total Bookings', value: stats.totalBookings, Icon: ClipboardList },
        { label: 'Pending Bookings', value: stats.pendingBookings, Icon: CalendarDays },
        { label: 'Confirmed Bookings', value: stats.confirmedBookings, Icon: ClipboardList },
        { label: 'Rejected Bookings', value: stats.rejectedBookings, Icon: ClipboardList },
        { label: 'Total Guests', value: stats.totalGuests, Icon: UsersRound },
        { label: 'Available Rooms', value: stats.availableRooms, Icon: BedDouble },
    ];

    const updateStatus = (bookingId: number, status: 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed') => {
        router.patch(`/hotel-admin/bookings/${bookingId}/status`, { status }, { preserveScroll: true });
    };

    const saveSettings = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        settingsForm.patch('/hotel-admin/settings');
    };

    const saveRoom = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        newRoomForm.post('/hotel-admin/rooms', { preserveScroll: true, onSuccess: () => newRoomForm.reset() });
    };

    const bookingRow = (booking: Booking) => (
        <tr key={booking.id} className="border-t border-[#eee7da] text-sm transition-colors hover:bg-[#f8f3e8]/65">
            <td className="px-4 py-4">
                <Link href={`/hotel-admin/bookings/${booking.id}`} className="font-semibold text-[#173c34] underline-offset-4 hover:text-[#9b651f] hover:underline focus-visible:outline-2 focus-visible:outline-[#d99d4b]">
                    {booking.reference_number || `Booking #${booking.id}`}
                </Link>
            </td>
            <td className="px-4 py-4">{booking.user?.name ?? 'Guest'}</td>
            <td className="px-4 py-4">{booking.hotel_room?.name ?? 'Room not assigned'}</td>
            <td className="px-4 py-4 whitespace-nowrap">{formatDate(booking.booking_date)}</td>
            <td className="px-4 py-4">{booking.guests}</td>
            <td className="px-4 py-4"><span className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold ${statusClasses[booking.status] ?? 'bg-[#ecefeb] text-[#53645d]'}`}>{booking.status}</span></td>
            <td className="px-4 py-4">
                {booking.status === 'Pending' && (
                    <div className="flex gap-2">
                        <button onClick={() => updateStatus(booking.id, 'Confirmed')} className="rounded-none border border-[#315d3c]/30 px-3 py-1.5 font-semibold text-[#315d3c] transition-colors hover:bg-[#e6f0e8] focus-visible:outline-2 focus-visible:outline-[#d99d4b]">Confirm</button>
                        <button onClick={() => updateStatus(booking.id, 'Rejected')} className="rounded-none border border-[#91463c]/25 px-3 py-1.5 font-semibold text-[#91463c] transition-colors hover:bg-[#f7e8e5] focus-visible:outline-2 focus-visible:outline-[#d99d4b]">Reject</button>
                    </div>
                )}
            </td>
        </tr>
    );

    const table = (items: Booking[]) => (
        <div className="overflow-x-auto rounded-lg border border-[#e5dcc9] bg-white shadow-[0_8px_24px_rgba(23,60,52,0.05)]">
            <table className="w-full min-w-[820px] text-left">
                <thead className="bg-[#f4efe4] text-[11px] uppercase tracking-[0.12em] text-[#53645d]">
                    <tr>{['Reference', 'Guest', 'Room', 'Booking date', 'Guests', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr>
                </thead>
                <tbody>{items.length ? items.map(bookingRow) : <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <ClipboardList aria-hidden="true" className="mx-auto text-[#b77c30]" size={25} strokeWidth={1.5} />
                    <p className="mt-3 text-sm font-semibold text-[#173c34]">No hotel bookings found.</p>
                    <p className="mt-1 text-xs text-[#718078]">New bookings will appear here once guests make reservations.</p>
                </td></tr>}</tbody>
            </table>
        </div>
    );

    return (
        <>
            <Head title={`Hotel Admin · ${title}`} />
            <div className="min-h-screen bg-[#f8f3e8] text-[#173c34]">
                {mobileOpen && <button aria-label="Close hotel navigation" className="fixed inset-0 z-30 bg-[#092c28]/55 lg:hidden" onClick={() => setMobileOpen(false)} />}
                <div className="mx-auto flex min-h-screen max-w-[1600px]">
                    <aside id="hotel-admin-sidebar" className={`fixed inset-y-0 left-0 z-40 w-[min(19rem,86vw)] overflow-y-auto bg-[#173c34] px-5 py-6 text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-start justify-between gap-3 border-b border-white/15 px-2 pb-6">
                            <div className="flex items-start gap-3">
                                <span className="mt-1 flex h-10 w-10 items-center justify-center border border-[#d99d4b]/70 text-[#edbd73]">
                                    <HotelIcon aria-hidden="true" size={20} strokeWidth={1.5} />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#edbd73]">HOTEL ADMIN</p>
                                    <p className="mt-2 text-base font-semibold">Abuyog Hotel Admin</p>
                                    <p className="mt-1 text-sm text-white/65">{hotel.name}</p>
                                </div>
                            </div>
                            <button type="button" aria-label="Close hotel navigation" onClick={() => setMobileOpen(false)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73] lg:hidden">
                                <X aria-hidden="true" size={18} />
                            </button>
                        </div>
                        <nav className="mt-6 space-y-1" aria-label="Hotel admin navigation">
                            {navItems.map((item) => {
                                const Icon = navIcons[item.section];

                                return (
                                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-current={section === item.section ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-none border-l-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73] ${section === item.section ? 'border-[#edbd73] bg-[#d99d4b] text-[#173c34]' : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'}`}>
                                        <Icon aria-hidden="true" size={17} strokeWidth={1.7} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="mt-8 space-y-1 border-t border-white/15 pt-4">
                            <Link href="/dashboard" className="flex min-h-11 items-center gap-3 rounded-none px-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73]">
                                <UserRound aria-hidden="true" size={17} strokeWidth={1.7} />
                                User Dashboard
                            </Link>
                            <button type="button" onClick={() => router.post('/logout')} className="flex min-h-11 w-full items-center gap-3 rounded-none px-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73]">
                                <LogOut aria-hidden="true" size={17} strokeWidth={1.7} />
                                Logout
                            </button>
                        </div>
                        <p className="mt-8 flex items-center gap-2 border-t border-white/15 px-2 pt-5 text-xs text-white/50">
                            <DoorOpen aria-hidden="true" size={15} />
                            Signed in as {user.name}
                        </p>
                    </aside>

                    <main
                        className="min-w-0 flex-1"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(248, 243, 232, 0.9), rgba(248, 243, 232, 0.9)), url('/Abuyog-hotel.jpg')",
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                        }}
                    >
                        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#d9d0be] bg-[#f8f3e8]/95 px-4 py-4 sm:px-7">
                            <button type="button" aria-label={mobileOpen ? 'Close hotel navigation' : 'Open hotel navigation'} aria-expanded={mobileOpen} aria-controls="hotel-admin-sidebar" onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-[#173c34]/25 bg-white text-[#173c34] transition-colors hover:border-[#d99d4b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99d4b] lg:hidden">
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <div>
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a96d22]">HOTEL ADMIN</p>
                                <h1 className="mt-1 text-xl font-semibold text-[#173c34] sm:text-2xl">{title}</h1>
                            </div>
                        </header>

                        <div className="mx-auto max-w-[1440px] space-y-8 p-4 sm:p-7 lg:p-9">
                            {section === 'dashboard' && (
                                <>
                                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {dashboardStats.map(({ label, value, Icon }) => (
                                            <article key={label} className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.055)] sm:p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#68766f]">{label}</p>
                                                    <span className="flex h-9 w-9 items-center justify-center border border-[#d99d4b]/35 bg-[#fbf4e7] text-[#a96d22]">
                                                        <Icon aria-hidden="true" size={18} strokeWidth={1.6} />
                                                    </span>
                                                </div>
                                                <p className="mt-4 text-4xl font-semibold tabular-nums text-[#173c34]">{value}</p>
                                            </article>
                                        ))}
                                    </section>
                                    <section>
                                        <div className="mb-4 flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a96d22]">GUEST ACTIVITY</p>
                                                <h2 className="mt-1 text-2xl font-semibold text-[#173c34]">Recent bookings</h2>
                                            </div>
                                            <Link href="/hotel-admin/bookings" className="rounded-none border-b border-[#d99d4b] pb-1 text-sm font-semibold text-[#173c34] transition-colors hover:text-[#9b651f] focus-visible:outline-2 focus-visible:outline-[#d99d4b]">View all</Link>
                                        </div>
                                        {table(bookings.slice(0, 8))}
                                    </section>
                                </>
                            )}

                            {section === 'bookings' && (
                                selectedBooking ? (
                                    <section className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)] sm:p-7">
                                        <Link href="/hotel-admin/bookings" className="text-sm font-semibold underline">← Back to bookings</Link>
                                        <h2 className="mt-5 font-serif text-3xl">{selectedBooking.user?.name ?? 'Guest'}</h2>
                                        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                            {[
                                                ['Reference', selectedBooking.reference_number],
                                                ['Accommodation', hotel.name],
                                                ['Room', selectedBooking.hotel_room?.name],
                                                ['Booking date', formatDate(selectedBooking.booking_date)],
                                                ['Guests', String(selectedBooking.guests)],
                                                ['Status', selectedBooking.status],
                                                ['Email', selectedBooking.user?.email],
                                                ['Contact', selectedBooking.user?.contact_number],
                                            ].map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wide text-[#718078]">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value || 'Not provided'}</dd></div>)}
                                        </dl>
                                        <p className="mt-5 border-t border-[#eee7da] pt-4 text-sm text-[#53645d]">{selectedBooking.message || 'No message provided.'}</p>
                                        {selectedBooking.status === 'Pending' && (
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <button onClick={() => updateStatus(selectedBooking.id, 'Confirmed')} className="rounded-none bg-emerald-700 px-5 py-2 text-sm font-semibold text-white">Confirm</button>
                                                <button onClick={() => updateStatus(selectedBooking.id, 'Rejected')} className="rounded-none bg-rose-700 px-5 py-2 text-sm font-semibold text-white">Reject</button>
                                            </div>
                                        )}
                                        {selectedBooking.status === 'Confirmed' && (
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <button onClick={() => updateStatus(selectedBooking.id, 'Completed')} className="rounded-none bg-[#173c34] px-5 py-2 text-sm font-semibold text-white">Mark completed</button>
                                                <button onClick={() => updateStatus(selectedBooking.id, 'Cancelled')} className="rounded-none border border-[#d7d2c5] px-5 py-2 text-sm font-semibold">Cancel booking</button>
                                            </div>
                                        )}
                                    </section>
                                ) : <section><h2 className="mb-4 font-serif text-2xl">Hotel bookings</h2>{table(bookings)}</section>
                            )}

                            {section === 'calendar' && (
                                <section>
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <h2 className="font-serif text-2xl">{new Date(`${calendarMonth}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                                        <div className="flex gap-2">
                                            {[-1, 1].map((offset) => {
                                                const [year, month] = calendarMonth.split('-').map(Number);
                                                const date = new Date(year, month - 1 + offset, 1);
                                                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                                                return <Link key={offset} href={`/hotel-admin/calendar?month=${value}`} className="rounded-none border border-[#d7d2c5] px-4 py-2 text-sm">{offset < 0 ? 'Previous' : 'Next'}</Link>;
                                            })}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-[#e5dcc9] bg-white shadow-[0_8px_24px_rgba(23,60,52,0.05)]">
                                        <div className="min-w-[700px]">
                                            <div className="grid grid-cols-7 bg-[#173c34] text-center text-xs font-semibold text-white">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="py-3">{day}</div>)}
                                            </div>
                                            <div className="grid grid-cols-7 border-l border-t border-[#e5dcc9] bg-white">
                                                {calendarCells.map((cell) => (
                                                    <div key={cell.key} className={`min-h-28 border-b border-r border-[#e5dcc9] p-1.5 sm:min-h-32 sm:p-2 ${cell.inMonth ? '' : 'bg-[#faf8f3] text-[#a7a398]'}`}>
                                                        <span className={`inline-flex min-h-7 min-w-7 items-center justify-center text-xs font-semibold ${cell.key === currentCalendarDate ? 'bg-[#d99d4b] text-[#173c34]' : ''}`}>{cell.date.getDate()}</span>
                                                        <div className="mt-1 space-y-1">
                                                            {(bookingsByDate.get(cell.key) ?? []).slice(0, 3).map((booking) => (
                                                                <Link key={booking.id} href={`/hotel-admin/bookings/${booking.id}`} className={`block truncate px-1.5 py-1 text-[10px] ${statusClasses[booking.status] ?? 'bg-[#ecefeb] text-[#53645d]'}`}>
                                                                    {booking.status}: {booking.user?.name ?? 'Guest'}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs text-[#718078]">Bookings shown are limited to Abuyog Hotel. Pending, confirmed, cancelled, and completed statuses are color-coded.</p>
                                </section>
                            )}

                            {section === 'rooms' && (
                                <>
                                    <p className="text-sm text-[#718078]">Seeded brochure prices are editable and are not verified as current official rates. Room capacity and inventory remain unlisted until the hotel admin confirms them.</p>
                                    <form onSubmit={saveRoom} className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)]">
                                        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a96d22]">ROOM INVENTORY</p>
                                        <h2 className="mb-5 mt-1 text-xl font-semibold text-[#173c34]">Add room inventory</h2>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="text-sm font-medium">Room name<input value={newRoomForm.data.name} onChange={(event) => newRoomForm.setData('name', event.target.value)} className={formFieldClasses} required /></label>
                                            <label className="text-sm font-medium">Room type<input value={newRoomForm.data.room_type} onChange={(event) => newRoomForm.setData('room_type', event.target.value)} className={formFieldClasses} required /></label>
                                            <label className="text-sm font-medium">Capacity<input type="number" min="1" value={newRoomForm.data.capacity} onChange={(event) => newRoomForm.setData('capacity', event.target.value)} className={formFieldClasses} /></label>
                                            <label className="text-sm font-medium">Price (PHP)<input type="number" min="0" step="0.01" value={newRoomForm.data.price} onChange={(event) => newRoomForm.setData('price', event.target.value)} className={formFieldClasses} /></label>
                                            <label className="text-sm font-medium">Available quantity<input type="number" min="0" value={newRoomForm.data.available_quantity} onChange={(event) => newRoomForm.setData('available_quantity', Number(event.target.value))} className={formFieldClasses} required /></label>
                                            <label className="text-sm font-medium">Status<select value={newRoomForm.data.status} onChange={(event) => newRoomForm.setData('status', event.target.value)} className={formFieldClasses}><option>Available</option><option>Maintenance</option><option>Unavailable</option></select></label>
                                            <label className="text-sm font-medium sm:col-span-2">Description<textarea rows={2} value={newRoomForm.data.description} onChange={(event) => newRoomForm.setData('description', event.target.value)} className={formFieldClasses} /></label>
                                            <label className="text-sm font-medium sm:col-span-2">Image path<input value={newRoomForm.data.image} onChange={(event) => newRoomForm.setData('image', event.target.value)} className={formFieldClasses} /></label>
                                        </div>
                                        <button disabled={newRoomForm.processing} className="mt-4 rounded-none bg-[#173c34] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Add room</button>
                                    </form>
                                    <div className="space-y-4">{rooms.map((room) => <RoomEditor key={room.id} room={room} />)}</div>
                                </>
                            )}

                            {section === 'guests' && (
                                    <section className="overflow-x-auto rounded-lg border border-[#e5dcc9] bg-white shadow-[0_8px_24px_rgba(23,60,52,0.05)]">
                                    <table className="w-full min-w-[760px] text-left">
                                        <thead className="bg-[#f8f3e8] text-xs uppercase tracking-wide text-[#53645d]"><tr>{['Guest', 'Contact', 'Email', 'Room', 'Reference', 'Booking date', 'Status'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
                                        <tbody>
                                            {guestBookings.length ? guestBookings.map((booking) => <tr key={booking.id} className="border-t border-[#eee7da] text-sm">
                                                <td className="px-4 py-4">{booking.user?.name ?? 'Guest'}</td><td className="px-4 py-4">{booking.user?.contact_number ?? 'Not provided'}</td><td className="px-4 py-4">{booking.user?.email ?? 'Not provided'}</td><td className="px-4 py-4">{booking.hotel_room?.name ?? 'Not assigned'}</td><td className="px-4 py-4">{booking.reference_number ?? `Booking #${booking.id}`}</td><td className="px-4 py-4 whitespace-nowrap">{formatDate(booking.booking_date)}</td><td className="px-4 py-4"><span className={`inline-flex rounded-sm px-2.5 py-1 text-xs font-semibold ${statusClasses[booking.status] ?? 'bg-[#ecefeb] text-[#53645d]'}`}>{booking.status}</span></td>
                                            </tr>) : <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#718078]">No hotel guests found.</td></tr>}
                                        </tbody>
                                    </table>
                                </section>
                            )}

                            {section === 'reports' && (
                                <>
                                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {[
                                            ['Total Bookings', stats.totalBookings],
                                            ['Confirmed Bookings', stats.confirmedBookings],
                                            ['Pending Bookings', stats.pendingBookings],
                                            ['Rejected Bookings', stats.rejectedBookings],
                                            ['Total Guests', stats.totalGuests],
                                            ['Room Occupancy Today', `${stats.roomOccupancy}%`],
                                        ].map(([label, value]) => <article key={label} className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)]"><p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#68766f]">{label}</p><p className="mt-3 text-3xl font-semibold tabular-nums text-[#173c34]">{value}</p></article>)}
                                    </section>
                                    <section className="rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)] sm:p-6">
                                        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a96d22]">PERFORMANCE</p>
                                        <h2 className="mt-1 text-2xl font-semibold text-[#173c34]">Booking trends</h2>
                                        <div className="mt-5 space-y-4">
                                            {bookingTrends.map((trend) => {
                                                const maximum = Math.max(1, ...bookingTrends.map((item) => item.bookings));

                                                return <div key={trend.month} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm">
                                                    <span className="text-[#53645d]">{trend.month}</span>
                                                    <div className="h-3 overflow-hidden rounded-full bg-[#f1eadb]"><div className="h-full rounded-full bg-[#d99d4b]" style={{ width: `${Math.max(trend.bookings ? 5 : 0, (trend.bookings / maximum) * 100)}%` }} /></div>
                                                    <span className="text-right font-semibold">{trend.bookings}</span>
                                                </div>;
                                            })}
                                        </div>
                                    </section>
                                </>
                            )}

                            {(section === 'settings' || section === 'profile') && (
                                    <form onSubmit={saveSettings} className="max-w-3xl rounded-lg border border-[#e5dcc9] bg-white/95 p-5 shadow-[0_8px_24px_rgba(23,60,52,0.05)] sm:p-7">
                                    <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a96d22]">HOTEL ADMIN</p>
                                    <h2 className="mt-1 text-2xl font-semibold text-[#173c34]">Hotel profile</h2>
                                    <p className="mt-2 text-sm text-[#718078]">Only Abuyog Hotel profile details can be changed here. Ownership, account roles, and hotel assignment are not editable.</p>
                                    <div className="mt-5 space-y-4">
                                        <label className="block text-sm font-medium">Hotel name<input value={settingsForm.data.name} onChange={(event) => settingsForm.setData('name', event.target.value)} className={formFieldClasses} required />{settingsForm.errors.name && <span className="mt-1 block text-xs text-rose-700">{settingsForm.errors.name}</span>}</label>
                                        <label className="block text-sm font-medium">Location<input value={settingsForm.data.location} onChange={(event) => settingsForm.setData('location', event.target.value)} className={formFieldClasses} required />{settingsForm.errors.location && <span className="mt-1 block text-xs text-rose-700">{settingsForm.errors.location}</span>}</label>
                                        <label className="block text-sm font-medium">Description<textarea rows={4} value={settingsForm.data.description} onChange={(event) => settingsForm.setData('description', event.target.value)} className={formFieldClasses} /></label>
                                        <label className="block text-sm font-medium">Contact information<input value={settingsForm.data.contact_information} onChange={(event) => settingsForm.setData('contact_information', event.target.value)} className={formFieldClasses} /></label>
                                        <label className="block text-sm font-medium">Price information<textarea rows={3} value={settingsForm.data.price_information} onChange={(event) => settingsForm.setData('price_information', event.target.value)} className={formFieldClasses} /></label>
                                    </div>
                                    <button disabled={settingsForm.processing} className="mt-5 rounded-none bg-[#173c34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">Save profile</button>
                                </form>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
