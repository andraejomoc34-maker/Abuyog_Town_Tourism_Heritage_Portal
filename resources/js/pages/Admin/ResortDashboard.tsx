import { Head, Link, router, useForm } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

type ResortInfo = {
    id?: number;
    name?: string;
    location?: string;
    image?: string | null;
    image_url?: string | null;
    contact_information?: string | null;
    description?: string | null;
};

type BookingItem = {
    id: number;
    reference_number?: string | null;
    status: string;
    guests: number;
    booking_date?: string;
    user?: { name?: string; contact_number?: string | null };
    cottage?: { id?: number; name?: string } | null;
    resort?: { name?: string };
};

type InquiryItem = {
    id: number;
    status: string;
    message?: string;
    user?: { name?: string };
    resort?: { name?: string };
};

type ResortNotification = {
    id: string;
    title: string;
    message: string;
    url: string;
    createdAt?: string | null;
};

type DashboardSection =
    | 'dashboard'
    | 'calendar'
    | 'cottages'
    | 'guests'
    | 'reviews'
    | 'reports'
    | 'announcements'
    | 'settings';

const navItems = [
    { label: 'Overview', href: '/resort-admin', key: 'dashboard' },
    { label: 'Bookings', href: '/resort-admin/bookings', key: 'bookings' },
    { label: 'Inquiries', href: '/resort-admin/inquiries', key: 'inquiries' },
    { label: 'Calendar', href: '/resort-admin/calendar', key: 'calendar' },
    { label: 'Cottages', href: '/resort-admin/cottages', key: 'cottages' },
    { label: 'Guests', href: '/resort-admin/guests', key: 'guests' },
    { label: 'Reviews', href: '/resort-admin/reviews', key: 'reviews' },
    { label: 'Reports', href: '/resort-admin/reports', key: 'reports' },
    { label: 'Announcements', href: '/resort-admin/announcements', key: 'announcements' },
    { label: 'Settings', href: '/resort-admin/settings', key: 'settings' },
] as const;

const statusClasses: Record<string, string> = {
    Pending: 'bg-[#fef3c7] text-[#854d0e]',
    Confirmed: 'bg-[#dcfce7] text-[#166534]',
    Rejected: 'bg-[#fee2e2] text-[#991b1b]',
    Answered: 'bg-[#dbeafe] text-[#1d4ed8]',
    Closed: 'bg-[#e5e7eb] text-[#374151]',
};

const formatDate = (value?: string) => {
    if (! value) {
        return 'Not set';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const shiftMonth = (month: string, offset: number) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(year, monthNumber - 1 + offset, 1);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getCalendarCells = (month: string) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNumber - 1, 1);
    const cellCount = Math.ceil((firstDay.getDay() + new Date(year, monthNumber, 0).getDate()) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
        const date = new Date(year, monthNumber - 1, index - firstDay.getDay() + 1);

        return {
            date,
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
            inMonth: date.getMonth() === monthNumber - 1,
        };
    });
};

export default function ResortDashboard({
    user,
    resort,
    stats,
    section,
    calendarMonth,
    currentMonth,
    sectionBookings,
    todayArrivals,
    pendingBookingsList,
    pendingInquiriesList,
    recentInquiries,
    recentBookings,
    upcomingBookings,
    cottageAvailability,
    notifications,
}: {
    user?: { name?: string; resort?: ResortInfo };
    resort?: ResortInfo;
    stats?: {
        totalBookings?: number;
        pendingInquiries?: number;
        pendingBookings?: number;
        confirmedBookings?: number;
        rejectedBookings?: number;
        totalInquiries?: number;
        totalCustomers?: number;
        availableCottages?: number;
        todayArrivals?: number;
    };
    sectionBookings?: BookingItem[];
    section?: DashboardSection;
    calendarMonth?: string;
    currentMonth?: string;
    todayArrivals?: BookingItem[];
    pendingBookingsList?: BookingItem[];
    pendingInquiriesList?: InquiryItem[];
    recentInquiries?: InquiryItem[];
    recentBookings?: BookingItem[];
    upcomingBookings?: BookingItem[];
    cottageAvailability?: { id: number; name: string; status: string; availableQuantity: number }[];
    notifications?: ResortNotification[];
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const currentSection = section ?? 'dashboard';
    const activeCalendarMonth = calendarMonth ?? new Date().toISOString().slice(0, 7);
    const [calendarYear, calendarMonthNumber] = activeCalendarMonth.split('-').map(Number);
    const calendarTitle = new Date(calendarYear, calendarMonthNumber - 1, 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });
    const calendarCells = getCalendarCells(activeCalendarMonth);
    const bookingsByDay = new Map<string, BookingItem[]>();
    sectionBookings?.forEach((booking) => {
        const key = String(booking.booking_date ?? '').slice(0, 10);
        bookingsByDay.set(key, [...(bookingsByDay.get(key) ?? []), booking]);
    });
    const settingsForm = useForm({
        name: resort?.name ?? '',
        location: resort?.location ?? '',
        description: resort?.description ?? '',
        contact_information: resort?.contact_information ?? '',
    });
    const titleMap: Record<DashboardSection, string> = {
        dashboard: 'Overview',
        calendar: 'Booking calendar',
        cottages: 'Cottage management',
        guests: 'Guest records',
        reviews: 'Guest reviews',
        reports: 'Resort reports',
        announcements: 'Announcements',
        settings: 'Resort settings',
    };

    const summaryCards = [
        { label: 'Total bookings', value: stats?.totalBookings ?? 0 },
        { label: 'Pending bookings', value: stats?.pendingBookings ?? 0 },
        { label: 'Confirmed bookings', value: stats?.confirmedBookings ?? 0 },
        { label: "Today's arrivals", value: stats?.todayArrivals ?? 0 },
        { label: 'Available cottages', value: stats?.availableCottages ?? 0 },
    ];

    const handleStatusUpdate = (bookingId: number, status: 'Confirmed' | 'Rejected') => {
        router.patch(`/bookings/${bookingId}/status`, { status }, {
            preserveScroll: true,
        });
    };

    const markNotificationRead = (notificationId: string) => {
        router.patch(`/resort-admin/notifications/${notificationId}/read`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={titleMap[currentSection]} />
            <div className="min-h-screen bg-[#f8f3e8] text-[#173c34]">
                <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
                    {mobileOpen && (
                        <button
                            aria-label="Close resort navigation"
                            className="fixed inset-0 z-30 bg-[#092c28]/45 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                            type="button"
                        />
                    )}
                    <aside id="resort-admin-navigation" className={`fixed inset-y-0 left-0 z-40 w-[min(19rem,86vw)] overflow-y-auto border-r border-[#e9e0d0] bg-[#123d36] p-5 text-white transition-transform duration-200 lg:relative lg:inset-auto lg:z-auto lg:w-[290px] lg:shrink-0 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d99d4b] text-sm font-bold text-[#123d36]">
                                {resort?.name ? resort.name.slice(0, 2).toUpperCase() : 'RT'}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f2cd8b]">
                                    Resort admin
                                </p>
                                <h2 className="mt-1 text-base font-semibold text-white">
                                    {resort?.name || 'Resort operations'}
                                </h2>
                            </div>
                        </div>

                        <nav className="mt-8 space-y-2">
                            {navItems.map((item) => {
                                const isActive = item.key === 'dashboard'
                                    ? currentSection === 'dashboard'
                                    : currentSection === item.key;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={[
                                            'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition',
                                            isActive
                                                ? 'bg-[#d99d4b] text-[#123d36] shadow-sm'
                                                : 'text-white/80 hover:bg-white/5 hover:text-white',
                                        ].join(' ')}
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-xs opacity-75">→</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2cd8b]">
                                Assigned resort
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                                {resort?.name || 'No resort assigned'}
                            </p>
                            <p className="mt-1 text-sm text-white/70">
                                {resort?.location || 'Location not available'}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => { setMobileOpen(false); router.post('/logout'); }}
                            className="mt-6 w-full rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                        >
                            Log out
                        </button>
                    </aside>

                    <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
                        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
                            <div className="min-w-0">
                                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#bd8b3d]">{resort?.name || 'Resort operations'}</p>
                                <p className="mt-1 truncate text-sm font-semibold">{titleMap[currentSection]}</p>
                            </div>
                            <button
                                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                aria-expanded={mobileOpen}
                                aria-controls="resort-admin-navigation"
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e9e0d0] bg-white text-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d]"
                                onClick={() => setMobileOpen((open) => !open)}
                                type="button"
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                        <header className="mb-8 rounded-[28px] border border-[#ebe1d0] bg-white px-5 py-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:px-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#bd8b3d]">
                                        Resort Administration
                                    </p>
                                    <h1 className="mt-2 font-serif text-3xl text-[#173c34]">
                                        {titleMap[currentSection]}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/resort-admin/bookings"
                                        className="rounded-none bg-[#173c34] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        Manage bookings
                                    </Link>
                                    <div className="flex items-center gap-3 rounded-full border border-[#e7dfd0] bg-[#f8f3e8] px-3 py-2">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d99d4b] font-semibold text-[#173c34]">
                                            {(user?.name ?? 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-[#173c34]">
                                                {user?.name || 'Resort admin'}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#718078]">
                                                Resort admin
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="mb-8 overflow-hidden rounded-[28px] border border-[#ebe1d0] bg-white shadow-[0_18px_45px_rgba(23,60,52,.06)]">
                            <div className="relative h-48 w-full overflow-hidden sm:h-56">
                                <img
                                    src={resort?.image_url || resort?.image || '/abuyog-2.jpg'}
                                    alt={resort?.name || 'Resort'}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#173c34]/75 to-[#173c34]/30" />
                                <div className="absolute inset-0 flex items-end p-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f2cd8b]">
                                            Resort Administration
                                        </p>
                                        <h2 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
                                            {resort?.name || 'No resort assigned'}
                                        </h2>
                                        <p className="mt-2 text-sm text-white/80">
                                            {resort?.location || 'This account still needs a resort assignment.'}
                                        </p>
                                        <p className="mt-1 text-sm text-white/80">Assigned admin: {user?.name || 'Resort admin'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_10px_30px_rgba(23,60,52,.04)]"
                                >
                                    <p className="text-sm text-[#718078]">{card.label}</p>
                                    <p className="mt-4 text-3xl font-semibold text-[#173c34]">{card.value}</p>
                                </div>
                            ))}
                        </div>

                        <section className="mt-6 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_10px_30px_rgba(23,60,52,.04)]">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="font-serif text-xl">Notifications</h2>
                                <span className="text-xs text-[#718078]">{notifications?.length ?? 0} unread</span>
                            </div>
                            {notifications && notifications.length > 0 ? (
                                <div className="divide-y divide-[#efe8dc]">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <Link href={notification.url} className="text-sm font-semibold text-[#173c34] hover:underline">{notification.title}</Link>
                                                <p className="mt-1 text-sm text-[#718078]">{notification.message}</p>
                                            </div>
                                            <button type="button" onClick={() => markNotificationRead(notification.id)} className="w-fit text-xs font-semibold text-[#53645d] underline decoration-[#d99d4b] underline-offset-4">Mark read</button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-[#718078]">No unread resort notifications.</p>}
                        </section>

                        {currentSection === 'dashboard' && (
                            <section className="mt-6 rounded-[24px] border border-[#e9e0d0] bg-white p-5 shadow-[0_10px_30px_rgba(23,60,52,.04)]">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="font-serif text-xl">Cottage availability</h2>
                                        <p className="mt-1 text-xs text-[#718078]">Based on today's pending and confirmed bookings.</p>
                                    </div>
                                    <Link href="/resort-admin/cottages" className="text-xs font-semibold text-[#173c34]">Manage cottages</Link>
                                </div>
                                {cottageAvailability && cottageAvailability.length > 0 ? (
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {cottageAvailability.map((cottage) => (
                                            <div key={cottage.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#efe8dc] px-4 py-3">
                                                <p className="truncate text-sm font-semibold">{cottage.name}</p>
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${cottage.status === 'Available' ? 'bg-[#dcfce7] text-[#166534]' : cottage.status === 'Booked' ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#fef3c7] text-[#854d0e]'}`}>
                                                    {cottage.status}{cottage.status === 'Available' ? ` · ${cottage.availableQuantity}` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm text-[#718078]">No cottages listed for this resort yet.</p>}
                            </section>
                        )}

                        {currentSection === 'dashboard' && (
                            <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <section className="rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h3 className="font-serif text-2xl text-[#173c34]">Today’s arrivals</h3>
                                        <Link href="/resort-admin/bookings" className="text-xs font-semibold text-[#173c34]">
                                            View all
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {todayArrivals && todayArrivals.length > 0 ? (
                                            todayArrivals.map((booking) => (
                                                <div key={booking.id} className="rounded-2xl border border-[#efe8dc] p-4">
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#173c34]">
                                                                {booking.user?.name || 'Guest'}
                                                            </p>
                                                            <p className="mt-1 text-sm text-[#718078]">
                                                                {booking.reference_number || `#${booking.id}`} · {booking.guests} guests
                                                            </p>
                                                        </div>
                                                        <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusClasses[booking.status] ?? 'bg-[#f1f5f9] text-[#475569]'].join(' ')}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#718078]">
                                                        <span>Arrival: {formatDate(booking.booking_date)}</span>
                                                                <span>Cottage: {booking.cottage?.name || 'Not assigned'}</span>
                                                        <span>Contact: {booking.user?.contact_number || 'Not provided'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-[#718078]">No arrivals scheduled for today.</p>
                                        )}
                                    </div>
                                </section>

                                <section className="rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h3 className="font-serif text-2xl text-[#173c34]">Pending actions</h3>
                                        <Link href="/resort-admin/bookings" className="text-xs font-semibold text-[#173c34]">
                                            Review
                                        </Link>
                                    </div>

                                    <div className="space-y-4">
                                        {pendingBookingsList && pendingBookingsList.length > 0 ? (
                                            pendingBookingsList.map((booking) => (
                                                    <div key={booking.id} className="rounded-2xl border border-[#efe8dc] p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-[#173c34]">
                                                                    {booking.reference_number || `#${booking.id}`}
                                                                </p>
                                                                <p className="mt-1 text-sm text-[#718078]">
                                                                    {booking.user?.name || 'Guest'} · {booking.guests} guests
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#718078]">{booking.cottage?.name || 'Cottage not assigned'}</p>
                                                            </div>
                                                            <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusClasses[booking.status] ?? 'bg-[#f1f5f9] text-[#475569]'].join(' ')}>
                                                                {booking.status}
                                                            </span>
                                                        </div>

                                                        <div className="mt-3 flex gap-2">
                                                            <Link href={`/resort-admin/bookings/${booking.id}`} className="rounded-none border border-[#d9d1c5] px-3 py-1.5 text-xs font-semibold text-[#173c34]">View</Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
                                                                className="rounded-none bg-[#173c34] px-3 py-1.5 text-xs font-semibold text-white"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusUpdate(booking.id, 'Rejected')}
                                                                className="rounded-none border border-[#d9d1c5] bg-white px-3 py-1.5 text-xs font-semibold text-[#173c34]"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <p className="text-sm text-[#718078]">You have no pending bookings.</p>
                                        )}
                                    </div>

                                    <div className="mt-5 border-t border-[#eee7da] pt-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-[#173c34]">New inquiries</h4>
                                            <Link href="/resort-admin/inquiries" className="text-xs font-semibold text-[#173c34]">View all</Link>
                                        </div>
                                        {pendingInquiriesList && pendingInquiriesList.length > 0 ? (
                                            <div className="space-y-2">
                                                {pendingInquiriesList.map((inquiry) => (
                                                    <div key={inquiry.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#fbf8f0] p-3">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold">{inquiry.user?.name || 'Guest'}</p>
                                                            <p className="truncate text-xs text-[#718078]">{inquiry.message || 'New inquiry'}</p>
                                                        </div>
                                                        <Link href={`/resort-admin/inquiries/${inquiry.id}`} className="shrink-0 text-xs font-semibold underline decoration-[#d99d4b] underline-offset-4">View</Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-sm text-[#718078]">No unanswered inquiries.</p>}
                                    </div>
                                </section>
                            </div>
                        )}

                        {currentSection === 'calendar' && (
                            <section className="mt-8 rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-serif text-2xl text-[#173c34]">{calendarTitle}</h3>
                                        <p className="mt-1 text-sm text-[#718078]">All resort bookings by date. Pending and confirmed bookings reserve inventory.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link aria-label="Previous month" title="Previous month" href={`/resort-admin/calendar?month=${shiftMonth(activeCalendarMonth, -1)}`} className="rounded-none border border-[#ded6c8] px-3 py-2 text-sm font-semibold hover:bg-[#f8f3e8]">←</Link>
                                        <Link href={`/resort-admin/calendar?month=${currentMonth ?? activeCalendarMonth}`} className="rounded-none border border-[#ded6c8] px-4 py-2 text-xs font-semibold hover:bg-[#f8f3e8]">Current month</Link>
                                        <Link aria-label="Next month" title="Next month" href={`/resort-admin/calendar?month=${shiftMonth(activeCalendarMonth, 1)}`} className="rounded-none border border-[#ded6c8] px-3 py-2 text-sm font-semibold hover:bg-[#f8f3e8]">→</Link>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-[980px]">
                                        <div className="grid grid-cols-7 border-b border-[#e9e0d0] text-center text-xs font-semibold text-[#718078]">
                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => <div key={day} className="px-2 py-3">{day}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7">
                                            {calendarCells.map((cell) => {
                                                const dayBookings = bookingsByDay.get(cell.key) ?? [];

                                                return (
                                                    <div key={cell.key} className={`min-h-36 border-b border-r border-[#eee7da] p-2 ${cell.inMonth ? 'bg-white' : 'bg-[#faf8f3] text-[#a4aaa5]'}`}>
                                                        <p className="mb-2 text-xs font-semibold">{cell.date.getDate()}</p>
                                                        <div className="space-y-1.5">
                                                            {dayBookings.map((booking) => (
                                                                <Link key={booking.id} href={`/resort-admin/bookings/${booking.id}`} className="block rounded-lg border border-[#e9e0d0] bg-[#f8f3e8] p-2 text-[10px] leading-4 text-[#173c34] hover:border-[#d99d4b]">
                                                                    <span className="block truncate font-semibold">{booking.cottage?.name || 'Cottage not assigned'}</span>
                                                                    <span className="block truncate">{booking.reference_number || `#${booking.id}`}</span>
                                                                    <span className="block truncate">{booking.user?.name || 'Guest'} · {booking.guests} guests</span>
                                                                    <span className="mt-1 block font-semibold">{booking.status}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                                        {currentSection === 'reports' && (
                                            <section className="mt-8 rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-serif text-2xl text-[#173c34]">Booking summary</h3>
                                        <p className="mt-1 text-sm text-[#718078]">Current totals for your assigned resort.</p>
                                    </div>
                                    <Link href="/resort-admin/bookings" className="text-xs font-semibold text-[#173c34]">Open bookings</Link>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {[
                                        { label: 'All bookings', value: stats?.totalBookings ?? 0 },
                                        { label: 'Confirmed', value: stats?.confirmedBookings ?? 0 },
                                        { label: 'Pending', value: stats?.pendingBookings ?? 0 },
                                        { label: 'Rejected', value: stats?.rejectedBookings ?? 0 },
                                    ].map((metric) => (
                                        <div key={metric.label} className="rounded-2xl border border-[#efe8dc] bg-[#f8f3e8] p-4">
                                            <p className="text-sm text-[#718078]">{metric.label}</p>
                                            <p className="mt-3 text-3xl font-semibold text-[#173c34]">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {currentSection === 'settings' && (
                            <section className="mt-8 rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                <h3 className="font-serif text-2xl text-[#173c34]">Resort profile</h3>
                                <p className="mt-1 text-sm text-[#718078]">Profile details currently maintained in the portal.</p>
                                <form onSubmit={(event) => { event.preventDefault(); settingsForm.patch('/resort-admin/settings', { preserveScroll: true }); }} className="mt-5 space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <label className="block text-xs font-semibold text-[#53645d]">Resort name
                                            <input value={settingsForm.data.name} onChange={(event) => settingsForm.setData('name', event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#bd8b3d]" maxLength={255} required />
                                            {settingsForm.errors.name && <span className="mt-1 block text-xs text-red-700">{settingsForm.errors.name}</span>}
                                        </label>
                                        <label className="block text-xs font-semibold text-[#53645d]">Location
                                            <input value={settingsForm.data.location} onChange={(event) => settingsForm.setData('location', event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#bd8b3d]" maxLength={255} required />
                                            {settingsForm.errors.location && <span className="mt-1 block text-xs text-red-700">{settingsForm.errors.location}</span>}
                                        </label>
                                    </div>
                                    <label className="block text-xs font-semibold text-[#53645d]">Contact information
                                        <input value={settingsForm.data.contact_information} onChange={(event) => settingsForm.setData('contact_information', event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#bd8b3d]" maxLength={255} />
                                        {settingsForm.errors.contact_information && <span className="mt-1 block text-xs text-red-700">{settingsForm.errors.contact_information}</span>}
                                    </label>
                                    <label className="block text-xs font-semibold text-[#53645d]">Description
                                        <textarea value={settingsForm.data.description} onChange={(event) => settingsForm.setData('description', event.target.value)} rows={5} maxLength={5000} className="mt-1.5 w-full rounded-xl border border-[#ded6c8] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#bd8b3d]" />
                                        {settingsForm.errors.description && <span className="mt-1 block text-xs text-red-700">{settingsForm.errors.description}</span>}
                                    </label>
                                    <button type="submit" disabled={settingsForm.processing} className="rounded-none bg-[#173c34] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                                        {settingsForm.processing ? 'Saving…' : 'Save resort profile'}
                                    </button>
                                </form>
                            </section>
                        )}


                        <div className="mt-8 grid gap-6 xl:grid-cols-2">
                            <section className="rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="font-serif text-2xl text-[#173c34]">Recent inquiries</h3>
                                    <Link href="/resort-admin/inquiries" className="text-xs font-semibold text-[#173c34]">
                                        View all
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {recentInquiries && recentInquiries.length > 0 ? (
                                        recentInquiries.map((inquiry) => (
                                            <div key={inquiry.id} className="rounded-2xl border border-[#efe8dc] p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm font-semibold text-[#173c34]">
                                                        {inquiry.user?.name || 'Guest'}
                                                    </p>
                                                    <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusClasses[inquiry.status] ?? 'bg-[#f1f5f9] text-[#475569]'].join(' ')}>
                                                        {inquiry.status}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-sm text-[#718078]">
                                                    {inquiry.message || 'No additional inquiry details were provided.'}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#718078]">No inquiries yet.</p>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-[28px] border border-[#e9e0d0] bg-white p-5 shadow-[0_18px_45px_rgba(23,60,52,.06)] sm:p-6">
                                <div className="mb-5 flex items-center justify-between">
                                    <h3 className="font-serif text-2xl text-[#173c34]">Upcoming stays</h3>
                                    <Link href="/resort-admin/bookings" className="text-xs font-semibold text-[#173c34]">
                                        Schedule
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {upcomingBookings && upcomingBookings.length > 0 ? (
                                        upcomingBookings.map((booking) => (
                                            <div key={booking.id} className="flex items-center justify-between rounded-2xl border border-[#efe8dc] p-4">
                                                <div>
                                                    <p className="text-xs font-bold tracking-[0.14em] text-[#bd8b3d]">{booking.reference_number || `#${booking.id}`}</p>
                                                    <p className="text-sm font-semibold text-[#173c34]">
                                                        {booking.user?.name || 'Guest'}
                                                    </p>
                                                    <p className="mt-1 text-sm text-[#718078]">
                                                        {formatDate(booking.booking_date)} · {booking.guests} guests
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#718078]">{booking.cottage?.name || 'Cottage not assigned'}</p>
                                                    <Link href={`/resort-admin/bookings/${booking.id}`} className="mt-2 inline-block text-xs font-semibold text-[#173c34] underline decoration-[#d99d4b] underline-offset-4">View booking</Link>
                                                </div>
                                                <span className={['inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold', statusClasses[booking.status] ?? 'bg-[#f1f5f9] text-[#475569]'].join(' ')}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-[#718078]">No upcoming pending or confirmed bookings.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
