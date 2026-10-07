import {
    Building2,
    CalendarDays,
    ChartNoAxesCombined,
    ClipboardList,
    House,
    LogOut,
    MapPin,
    Megaphone,
    Menu,
    MessageSquareText,
    Mountain,
    Settings,
    Star,
    UserRound,
    UsersRound,
    Utensils,
    X,
} from 'lucide-react';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

type DashboardStats = {
    totalTouristSpots: number;
    totalHeritageSites: number;
    totalResorts: number;
    totalEvents: number;
    totalRegisteredUsers: number;
    totalResortAdmins: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    totalInquiries: number;
    totalAnnouncements: number;
};

type RecentAnnouncement = {
    id: number;
    title: string;
    status: string;
    updated_at: string;
};

const statItems = [
    { key: 'totalTouristSpots', label: 'Tourist Spots', icon: MapPin },
    { key: 'totalHeritageSites', label: 'Heritage Sites', icon: Mountain },
    { key: 'totalResorts', label: 'Resorts', icon: Building2 },
    { key: 'totalEvents', label: 'Events', icon: CalendarDays },
    { key: 'totalRegisteredUsers', label: 'Registered Users', icon: UsersRound },
    { key: 'totalResortAdmins', label: 'Resort Admins', icon: UserRound },
    { key: 'totalBookings', label: 'Bookings', icon: ClipboardList },
    { key: 'pendingBookings', label: 'Pending Bookings', icon: CalendarDays },
    { key: 'confirmedBookings', label: 'Confirmed Bookings', icon: CalendarDays },
    { key: 'totalInquiries', label: 'Inquiries', icon: MessageSquareText },
    { key: 'totalAnnouncements', label: 'Announcements', icon: Megaphone },
] satisfies { key: keyof DashboardStats; label: string; icon: typeof MapPin }[];

const navGroups = [
    {
        label: 'Tourism',
        items: [
            { label: 'Tourist Spots', href: '/municipality-admin/tourist-spots', icon: MapPin },
            { label: 'Nature', href: '/discover/nature', icon: Mountain },
            { label: 'Heritage', href: '/#history', icon: Building2 },
            { label: 'Culture', href: '/discover/culture', icon: Star },
            { label: 'Festivals & Events', href: '/#festival', icon: CalendarDays },
            { label: 'Local Food', href: '/#culture', icon: Utensils },
        ],
    },
    {
        label: 'Operations',
        items: [
            { label: 'Announcements', href: '/municipality-admin/announcements', icon: Megaphone },
            { label: 'Resorts', href: '/municipality-admin/resorts', icon: Building2 },
            { label: 'Resort Information', href: '/municipality-admin/resorts', icon: House },
            { label: 'Cottages', href: '/municipality-admin/cottages', icon: House },
            { label: 'All Bookings', href: '/municipality-admin/bookings', icon: ClipboardList },
            { label: 'Pending Bookings', href: '/municipality-admin/bookings?status=Pending', icon: CalendarDays },
            { label: 'Confirmed Bookings', href: '/municipality-admin/bookings?status=Confirmed', icon: CalendarDays },
            { label: 'Completed Bookings', href: '/municipality-admin/bookings?status=Completed', icon: CalendarDays },
            { label: 'Inquiries', href: '/municipality-admin/inquiries', icon: MessageSquareText },
            { label: 'Users', href: '/municipality-admin/users', icon: UsersRound },
            { label: 'Feedback', href: '/municipality-admin/feedback', icon: Star },
            { label: 'Reports', href: '/municipality-admin/reports', icon: ChartNoAxesCombined },
        ],
    },
    {
        label: 'Account',
        items: [
            { label: 'Profile', href: '/profile', icon: UserRound },
            { label: 'Settings', href: '/profile', icon: Settings },
        ],
    },
];

export default function MunicipalityDashboard({
    user,
    stats,
    recentAnnouncements,
}: {
    user: { name: string };
    stats: DashboardStats;
    recentAnnouncements: RecentAnnouncement[];
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <Head title="Municipality Tourism Office" />
            <div className="min-h-screen bg-[#f8f3e8] text-[#173c34]">
                {mobileOpen && (
                    <button
                        aria-label="Close municipality navigation"
                        className="fixed inset-0 z-30 bg-[#092c28]/45 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                        type="button"
                    />
                )}
                <aside id="municipality-navigation" className={`fixed inset-y-0 left-0 z-40 w-[min(18rem,86vw)] overflow-y-auto border-r border-[#ded7c8] bg-white transition-transform duration-200 lg:z-20 lg:w-72 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="border-b border-[#ece5d8] px-5 py-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">
                            ABUYOG MUNICIPAL
                        </p>
                        <h1 className="mt-1 font-serif text-xl leading-tight">
                            Tourism Office
                        </h1>
                        <p className="mt-2 truncate text-xs text-[#68766f]">
                            {user.name}
                        </p>
                    </div>
                    <nav
                        aria-label="Municipality office navigation"
                        className="space-y-5 px-5 py-4 lg:py-5"
                    >
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-[#9b8b70] uppercase">
                                    {group.label}
                                </p>
                                <div className="grid gap-1">
                                    {group.items.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                className="flex min-h-9 items-center gap-2 rounded-md px-2.5 text-xs text-[#53645d] transition hover:bg-[#f4f1e8] hover:text-[#173c34] lg:text-sm"
                                                href={item.href}
                                                key={item.label}
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <Icon className="h-4 w-4 shrink-0 text-[#9b6a28]" />
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                    <div className="border-t border-[#ece5d8] px-5 py-3 lg:absolute lg:right-0 lg:bottom-0 lg:left-0 lg:bg-white">
                        <button
                            className="flex min-h-11 w-full items-center gap-2 px-2 text-sm font-medium text-[#53645d] hover:text-[#173c34]"
                            onClick={() => router.post('/logout')}
                            type="button"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="px-5 py-7 sm:px-8 lg:ml-72 lg:px-10 lg:py-9">
                    <div className="mb-5 flex items-center justify-between lg:hidden">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG MUNICIPAL</p>
                            <p className="text-sm font-semibold">Tourism Office</p>
                        </div>
                        <button
                            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileOpen}
                            aria-controls="municipality-navigation"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#ded7c8] bg-white text-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d]"
                            onClick={() => setMobileOpen((open) => !open)}
                            type="button"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                    <div className="mx-auto max-w-[1500px]">
                        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#ded7c8] pb-6">
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.2em] text-[#9b6a28]">
                                    MUNICIPAL TOURISM · HERITAGE · CULTURE & ARTS
                                </p>
                                <h2 className="mt-2 font-serif text-3xl font-normal sm:text-4xl">
                                    Dashboard
                                </h2>
                            </div>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#173c34] px-4 text-sm font-semibold text-white transition hover:bg-[#245548]"
                                href="/municipality-admin/announcements/create"
                            >
                                <Megaphone className="h-4 w-4 text-[#edbd73]" />
                                New Announcement
                            </Link>
                        </div>

                        <section
                            aria-label="Municipality tourism statistics"
                            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                        >
                            {statItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        className="min-h-28 rounded-lg border border-[#e5ddce] bg-white p-4"
                                        key={item.key}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs text-[#68766f]">{item.label}</p>
                                            <Icon className="h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                        </div>
                                        <p className="mt-4 font-serif text-3xl">{stats[item.key]}</p>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="mt-8 rounded-lg border border-[#e5ddce] bg-white">
                            <div className="flex items-center justify-between gap-4 border-b border-[#eee7da] px-5 py-4">
                                <div>
                                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9b6a28] uppercase">
                                        Latest updates
                                    </p>
                                    <h3 className="mt-1 font-serif text-xl">Announcements</h3>
                                </div>
                                <Link
                                    className="text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4"
                                    href="/municipality-admin/announcements"
                                >
                                    View all
                                </Link>
                            </div>
                            {recentAnnouncements.length > 0 ? (
                                <ul className="divide-y divide-[#eee7da]">
                                    {recentAnnouncements.map((announcement) => (
                                        <li
                                            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                                            key={announcement.id}
                                        >
                                            <span className="text-sm font-medium">{announcement.title}</span>
                                            <span className="text-xs text-[#68766f]">
                                                {announcement.status} ·{' '}
                                                {new Date(announcement.updated_at).toLocaleDateString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="px-5 py-6 text-sm text-[#68766f]">
                                    No announcements have been created yet.
                                </p>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}