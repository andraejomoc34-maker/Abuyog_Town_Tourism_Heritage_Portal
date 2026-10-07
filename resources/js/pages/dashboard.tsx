import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type IconName =
    | 'dashboard'
    | 'discover'
    | 'pin'
    | 'heritage'
    | 'history'
    | 'calendar'
    | 'food'
    | 'stay'
    | 'route'
    | 'heart'
    | 'review'
    | 'bell'
    | 'profile'
    | 'settings'
    | 'search'
    | 'menu'
    | 'close'
    | 'chevron'
    | 'arrow'
    | 'eye'
    | 'clock'
    | 'trash'
    | 'logout'
    | 'sparkle';

function Icon({
    name,
    className = 'h-5 w-5',
}: {
    name: IconName;
    className?: string;
}) {
    const paths: Record<IconName, string> = {
        dashboard: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
        discover:
            'm12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z',
        pin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
        heritage:
            'M3 21h18 M4 10h16 M5 6l7-3 7 3 M6 10v8 M10 10v8 M14 10v8 M18 10v8',
        history: 'M3 12a9 9 0 1 0 2.6-6.4L3 8 M3 3v5h5 M12 7v5l3 2',
        calendar:
            'M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z M8 14h.01 M12 14h.01 M16 14h.01',
        food: 'M7 3v7 M4 3v4a3 3 0 0 0 6 0V3 M7 10v11 M17 3v18 M17 3c2 2 3 5 3 8h-3',
        stay: 'M3 21V8l9-5 9 5v13 M3 12h18 M7 16h3 M14 16h3 M9 21v-5 M15 21v-5',
        route: 'M4 6a2 2 0 1 0 0-.01 M20 18a2 2 0 1 0 0-.01 M6 6h4a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h2 M18 15l2 3-2 3',
        heart: 'M20.8 8.6c0 5.4-8.8 11.4-8.8 11.4S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6a4.6 4.6 0 0 1 8.8 2.6Z',
        review: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z',
        bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
        profile: 'M20 21a8 8 0 0 0-16 0 M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
        settings:
            'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.5-1l-.2.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3.4l.2-.1a1.7 1.7 0 0 0 1-1.5l-.1-.2 1.7-2.9.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3.4l.1.2a1.7 1.7 0 0 0 1.5 1l.2-.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3.4l-.2.1a1.7 1.7 0 0 0-1 1.5Z',
        search: 'm20 20-4.5-4.5 M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
        menu: 'M4 6h16 M4 12h16 M4 18h16',
        close: 'm18 6-12 12 M6 6l12 12',
        chevron: 'm7 10 5 5 5-5',
        arrow: 'M7 17 17 7 M7 7h10v10',
        eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
        clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2',
        trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 15H6L5 6 M10 11v6 M14 11v6',
        logout: 'M10 17l5-5-5-5 M15 12H3 M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6',
        sparkle:
            'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z',
    };

    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            viewBox="0 0 24 24"
        >
            <path d={paths[name]} />
        </svg>
    );
}

const navigation = [
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
    { label: 'Discover', icon: 'discover', href: '/#discover' },
    { label: 'Resorts', icon: 'stay', href: '/resorts' },
    { label: 'Tourist Spots', icon: 'pin', href: '/#discover' },
    { label: 'Heritage', icon: 'heritage', href: '/#heritage' },
    { label: 'History', icon: 'history', href: '/#heritage' },
    { label: 'Festivals & Events', icon: 'calendar', href: '/#festival' },
    { label: 'Local Food', icon: 'food', href: '/#culture' },
    { label: 'Accommodations', icon: 'stay', href: '/resorts' },
    { label: 'Travel Guide', icon: 'route', href: '/#discover' },
    { label: 'My Bookings', icon: 'calendar', href: '/my-bookings' },
    { label: 'My Inquiries', icon: 'review', href: '/my-inquiries' },
    { label: 'Favorites', icon: 'heart', href: '#favorites' },
    { label: 'My Reviews', icon: 'review', href: '#reviews' },
    { label: 'Notifications', icon: 'bell', href: '#notifications' },
    { label: 'Profile', icon: 'profile', href: '/profile' },
    { label: 'Settings', icon: 'settings', href: '/profile' },
] satisfies { label: string; icon: IconName; href: string }[];

const destinations = [
    {
        name: 'Coastal Escape',
        location: 'Abuyog, Leyte',
        category: 'Natural Attraction',
        description:
            'Take in the quiet beauty of the coast and its open skies.',
        image: '/Abuyog-5.jpg',
    },
    {
        name: 'Heritage & History',
        location: 'Abuyog, Leyte',
        category: 'Heritage Site',
        description: 'Explore the places and stories that shape the town.',
        image: '/balsa-kafe.jpg',
    },
    {
        name: 'Culture & Festival',
        location: 'Abuyog, Leyte',
        category: 'Cultural Destination',
        description: 'Discover local traditions, celebration, and community.',
        image: '/Abuyog-5.jpg',
    },
];

const notifications = [
    {
        title: 'New destination added',
        detail: 'There is more of Abuyog to discover.',
        icon: 'pin',
    },
    {
        title: 'Tourism announcement',
        detail: 'Check the latest town updates.',
        icon: 'sparkle',
    },
    {
        title: 'Upcoming event',
        detail: 'Buyogan Festival event details are to be announced.',
        icon: 'calendar',
    },
    {
        title: 'Review update',
        detail: 'Your travel notes are ready to revisit.',
        icon: 'review',
    },
] satisfies { title: string; detail: string; icon: IconName }[];

function Avatar({ name, image }: { name: string; image?: string }) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return image ? (
        <img
            alt=""
            className="h-10 w-10 rounded-full border border-[#dce3dc] object-cover"
            src={image}
        />
    ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c59f] bg-[#f2ead9] text-sm font-semibold text-[#123d36]">
            {initials || 'A'}
        </span>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [favorites, setFavorites] = useState(destinations.slice(0, 2));

    if (!user) {
        return null;
    }

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
          })
        : 'Abuyog community member';

    function logout() {
        router.post('/logout');
    }

    function renderSidebar(isMobile = false) {
        return (
            <aside className="flex h-full w-[min(19rem,86vw)] flex-col border-r border-[#dce3dc] bg-[#fffdf8] px-4 py-5 lg:w-64 lg:px-4">
                <div className="flex items-center justify-between px-2 pb-7">
                    <Link
                        href="/"
                        className="flex items-center gap-3 no-underline"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#bd8b3d] text-lg text-[#bd8b3d]">
                            {'\u2726'}
                        </span>
                        <span>
                            <strong className="block text-[11px] tracking-[0.18em] text-[#123d36]">
                                ABUYOG TOURISM
                            </strong>
                            <small className="mt-1 block text-[9px] tracking-[0.12em] text-[#71807a]">
                                TOURISM &amp; HERITAGE
                            </small>
                        </span>
                    </Link>
                    {isMobile && (
                        <button
                            aria-label="Close navigation"
                            className="rounded-sm p-2 text-[#123d36] hover:bg-[#f2ead9] lg:hidden"
                            onClick={() => setMobileOpen(false)}
                            type="button"
                        >
                            <Icon name="close" />
                        </button>
                    )}
                </div>
                <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.16em] text-[#9a7a46] uppercase">
                    Your journey
                </p>
                <nav aria-label="Dashboard navigation" className="space-y-1">
                    {navigation.map((item) => {
                        const active = item.label === 'Dashboard';
                        return (
                            <Link
                                aria-current={active ? 'page' : undefined}
                                className={`flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm transition-colors ${active ? 'bg-[#eaf0e9] font-semibold text-[#123d36]' : 'text-[#53645d] hover:bg-[#f4f1e8] hover:text-[#123d36]'}`}
                                href={item.href}
                                key={item.label}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon
                                    className="h-[18px] w-[18px] shrink-0"
                                    name={item.icon}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    {(user?.role === 'municipality_admin' || user?.role === 'super_admin') && (
                        <Link
                            className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm text-[#53645d] transition-colors hover:bg-[#f4f1e8] hover:text-[#123d36]"
                            href="/super-admin/feedback"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon className="h-[18px] w-[18px] shrink-0" name="review" />
                            <span>Visitor Feedback</span>
                        </Link>
                    )}
                    {user?.role === 'super_admin' && (
                        <>
                            <Link
                                className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm text-[#53645d] transition-colors hover:bg-[#f4f1e8] hover:text-[#123d36]"
                                href="/super-admin/announcements"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className="h-[18px] w-[18px] shrink-0" name="review" />
                                <span>Announcements</span>
                            </Link>
                            <Link
                                className="flex min-h-10 items-center gap-3 rounded-sm px-3 text-sm text-[#53645d] transition-colors hover:bg-[#f4f1e8] hover:text-[#123d36]"
                                href="/super-admin/accounts"
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon className="h-[18px] w-[18px] shrink-0" name="settings" />
                                <span>Admin Accounts</span>
                            </Link>
                        </>
                    )}
                </nav>
                <div className="mt-auto border-t border-[#dce3dc] pt-4">
                    <button
                        className="flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-sm font-medium text-[#53645d] transition-colors hover:bg-[#f4f1e8] hover:text-[#123d36]"
                        onClick={logout}
                        type="button"
                    >
                        <Icon className="h-[18px] w-[18px]" name="logout" />
                        Log Out
                    </button>
                </div>
            </aside>
        );
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#1c2926]">
                <div className="fixed inset-y-0 left-0 z-20 hidden lg:block">
                    {renderSidebar()}
                </div>

                {mobileOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <button
                            aria-label="Close navigation"
                            className="absolute inset-0 h-full w-full bg-[#092c28]/45"
                            onClick={() => setMobileOpen(false)}
                            type="button"
                        />
                        <div className="relative h-full">
                            {renderSidebar(true)}
                        </div>
                    </div>
                )}

                <div className="min-h-screen lg:pl-64">
                    <header className="sticky top-0 z-10 border-b border-[#dce3dc] bg-[#fffdf8]/95 backdrop-blur-sm">
                        <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-9">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    aria-label="Open navigation"
                                    className="rounded-sm p-2 text-[#123d36] hover:bg-[#f2ead9] lg:hidden"
                                    onClick={() => setMobileOpen(true)}
                                    type="button"
                                >
                                    <Icon name="menu" />
                                </button>
                                <p className="truncate text-xs font-semibold text-[#53645d] sm:text-sm">
                                    Abuyog Tourism &amp; Heritage Portal
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                                <label className="hidden h-10 items-center gap-2 border-b border-[#dce3dc] text-[#71807a] md:flex">
                                    <Icon className="h-4 w-4" name="search" />
                                    <input
                                        aria-label="Search"
                                        className="w-36 bg-transparent text-sm text-[#1c2926] outline-none placeholder:text-[#8b9690] lg:w-48"
                                        placeholder="Search Abuyog"
                                        type="search"
                                    />
                                </label>
                                <button
                                    aria-label="View notifications"
                                    className="relative rounded-sm p-2 text-[#53645d] transition hover:bg-[#f2ead9]"
                                    onClick={() =>
                                        document
                                            .getElementById('notifications')
                                            ?.scrollIntoView({
                                                behavior: 'smooth',
                                            })
                                    }
                                    type="button"
                                >
                                    <Icon name="bell" />
                                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#bd8b3d]" />
                                </button>
                                <div className="relative">
                                    <button
                                        aria-expanded={profileOpen}
                                        aria-haspopup="menu"
                                        className="flex min-h-11 items-center gap-2 rounded-sm px-1.5 py-1 transition hover:bg-[#f4f1e8] sm:gap-3 sm:px-2"
                                        onClick={() =>
                                            setProfileOpen(!profileOpen)
                                        }
                                        type="button"
                                    >
                                        <Avatar
                                            image={user.avatar}
                                            name={user.name}
                                        />
                                        <span className="hidden max-w-32 truncate text-left text-sm font-medium text-[#34453f] sm:block">
                                            {user.name}
                                        </span>
                                        <Icon
                                            className="hidden h-4 w-4 text-[#71807a] sm:block"
                                            name="chevron"
                                        />
                                    </button>
                                    {profileOpen && (
                                        <div
                                            className="absolute top-full right-0 mt-2 w-48 border border-[#dce3dc] bg-[#fffdf8] py-1 shadow-lg"
                                            role="menu"
                                        >
                                            {[
                                                ['Profile', '/profile'],
                                                ['Favorites', '#favorites'],
                                                ['My Reviews', '#reviews'],
                                                ['Settings', '/profile'],
                                            ].map(([label, href]) => (
                                                <Link
                                                    className="block px-4 py-2.5 text-sm text-[#53645d] hover:bg-[#f4f1e8] hover:text-[#123d36]"
                                                    href={href}
                                                    key={label}
                                                    onClick={() =>
                                                        setProfileOpen(false)
                                                    }
                                                    role="menuitem"
                                                >
                                                    {label}
                                                </Link>
                                            ))}
                                            <button
                                                className="w-full border-t border-[#dce3dc] px-4 py-2.5 text-left text-sm text-[#53645d] hover:bg-[#f4f1e8] hover:text-[#123d36]"
                                                onClick={logout}
                                                role="menuitem"
                                                type="button"
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
                        <section className="mb-8 flex flex-col items-start justify-between gap-5 border-b border-[#dce3dc] pb-7 sm:flex-row sm:items-end">
                            <div>
                                <p className="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#bd8b3d] uppercase">
                                    Your Abuyog account
                                </p>
                                <h1 className="font-serif text-3xl font-normal text-[#123d36] sm:text-4xl">
                                    Good morning, {user.name}!{' '}
                                    <span className="text-2xl">
                                        {'\u{1F44B}'}
                                    </span>
                                </h1>
                                <p className="mt-2 text-sm text-[#71807a]">
                                    Discover something beautiful in Abuyog
                                    today.
                                </p>
                            </div>
                            <Link
                                className="inline-flex min-h-11 items-center justify-between gap-6 rounded-sm bg-[#123d36] px-5 text-sm font-semibold text-white transition hover:bg-[#092c28]"
                                href="/#discover"
                            >
                                Explore Abuyog
                                <Icon
                                    className="h-4 w-4 text-[#e4b660]"
                                    name="arrow"
                                />
                            </Link>
                        </section>

                        <section
                            aria-label="Your activity"
                            className="mb-9 grid grid-cols-2 gap-3 xl:grid-cols-4"
                        >
                            {[
                                {
                                    label: 'Saved Places',
                                    value: favorites.length ? '12' : '0',
                                    icon: 'heart',
                                },
                                {
                                    label: 'My Reviews',
                                    value: '5',
                                    icon: 'review',
                                },
                                {
                                    label: 'Places Explored',
                                    value: '24',
                                    icon: 'pin',
                                },
                                {
                                    label: 'Upcoming Events',
                                    value: '3',
                                    icon: 'calendar',
                                },
                            ].map((stat) => (
                                <article
                                    className="flex min-h-28 items-center justify-between border border-[#dce3dc] bg-[#fffdf8] px-4 py-4 sm:px-5"
                                    key={stat.label}
                                >
                                    <div>
                                        <p className="text-xs text-[#71807a]">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 font-serif text-3xl text-[#123d36]">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eaf0e9] text-[#123d36]">
                                        <Icon name={stat.icon as IconName} />
                                    </span>
                                </article>
                            ))}
                        </section>

                        <section className="mb-9" id="discover">
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <div>
                                    <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                        Handpicked for you
                                    </p>
                                    <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                        Featured Destinations
                                    </h2>
                                </div>
                                <Link
                                    className="text-xs font-semibold text-[#123d36] underline decoration-[#bd8b3d] underline-offset-4"
                                    href="/#discover"
                                >
                                    Explore all
                                </Link>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {destinations.map((place) => (
                                    <article
                                        className="group overflow-hidden border border-[#dce3dc] bg-[#fffdf8] transition-shadow hover:shadow-md"
                                        key={place.name}
                                    >
                                        <div className="relative h-44 overflow-hidden bg-[#e8ede7]">
                                            <img
                                                alt={place.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                loading="lazy"
                                                src={place.image}
                                            />
                                            <span className="absolute top-3 left-3 bg-[#fffdf8]/95 px-2.5 py-1 text-[10px] font-semibold text-[#123d36]">
                                                {place.category}
                                            </span>
                                            <button
                                                aria-label={`Save ${place.name} to favorites`}
                                                className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-none bg-[#fffdf8]/95 text-[#123d36] transition hover:bg-white"
                                                onClick={() =>
                                                    setFavorites((saved) =>
                                                        saved.some(
                                                            (item) =>
                                                                item.name ===
                                                                place.name,
                                                        )
                                                            ? saved.filter(
                                                                  (item) =>
                                                                      item.name !==
                                                                      place.name,
                                                              )
                                                            : [...saved, place],
                                                    )
                                                }
                                                type="button"
                                            >
                                                <Icon
                                                    className="h-[18px] w-[18px]"
                                                    name="heart"
                                                />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-serif text-xl text-[#123d36]">
                                                {place.name}
                                            </h3>
                                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71807a]">
                                                <Icon
                                                    className="h-3.5 w-3.5"
                                                    name="pin"
                                                />
                                                {place.location}
                                            </p>
                                            <p className="mt-3 min-h-10 text-sm leading-5 text-[#53645d]">
                                                {place.description}
                                            </p>
                                            <Link
                                                className="mt-4 inline-flex min-h-10 w-full items-center justify-between border-t border-[#dce3dc] pt-3 text-sm font-semibold text-[#123d36]"
                                                href="/#discover"
                                            >
                                                View Details{' '}
                                                <Icon
                                                    className="h-4 w-4 text-[#bd8b3d]"
                                                    name="arrow"
                                                />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="mb-9 grid gap-7 xl:grid-cols-[1.4fr_1fr]">
                            <div id="festival">
                                <div className="mb-4 flex items-end justify-between">
                                    <div>
                                        <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                            Make a little room for celebration
                                        </p>
                                        <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                            Upcoming Events
                                        </h2>
                                    </div>
                                    <Link
                                        className="text-xs font-semibold text-[#123d36] underline decoration-[#bd8b3d] underline-offset-4"
                                        href="/#festival"
                                    >
                                        All events
                                    </Link>
                                </div>
                                <article className="flex flex-col gap-4 border border-[#dce3dc] bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#f2ead9] text-[#9a7a46]">
                                            <Icon name="calendar" />
                                        </span>
                                        <div>
                                            <h3 className="font-serif text-xl text-[#123d36]">
                                                Buyogan Festival
                                            </h3>
                                            <p className="mt-1 text-xs font-medium text-[#9a7a46]">
                                                Date to be announced
                                            </p>
                                            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#71807a]">
                                                <Icon
                                                    className="h-3.5 w-3.5"
                                                    name="pin"
                                                />
                                                Abuyog, Leyte
                                            </p>
                                            <p className="mt-2 max-w-xl text-sm leading-5 text-[#53645d]">
                                                Celebrate the culture and
                                                community spirit of Abuyog.
                                                Event details will be shared
                                                when available.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        className="inline-flex min-h-10 shrink-0 items-center justify-center border border-[#123d36] px-4 text-xs font-semibold text-[#123d36] transition hover:bg-[#eaf0e9]"
                                        href="/#festival"
                                    >
                                        View Event
                                    </Link>
                                </article>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                        Start with a feeling
                                    </p>
                                    <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                        Quick Actions
                                    </h2>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            label: 'Explore Resorts',
                                            icon: 'stay',
                                            href: '/resorts',
                                        },
                                        {
                                            label: 'My Bookings',
                                            icon: 'calendar',
                                            href: '/my-bookings',
                                        },
                                        {
                                            label: 'My Inquiries',
                                            icon: 'review',
                                            href: '/my-inquiries',
                                        },
                                        {
                                            label: 'Explore Tourist Spots',
                                            icon: 'pin',
                                            href: '/#discover',
                                        },
                                        {
                                            label: 'Explore Heritage',
                                            icon: 'heritage',
                                            href: '/#heritage',
                                        },
                                        {
                                            label: 'Discover Local Food',
                                            icon: 'food',
                                            href: '/#culture',
                                        },
                                        {
                                            label: 'Plan Your Trip',
                                            icon: 'route',
                                            href: '/#discover',
                                        },
                                    ].map((action) => (
                                        <Link
                                            className="flex min-h-24 flex-col justify-between border border-[#dce3dc] bg-[#fffdf8] p-3 text-sm font-medium text-[#34453f] transition hover:border-[#bd8b3d] hover:bg-white sm:p-4"
                                            href={action.href}
                                            key={action.label}
                                        >
                                            <Icon
                                                className="h-5 w-5 text-[#9a7a46]"
                                                name={action.icon as IconName}
                                            />
                                            <span>{action.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="mb-9 grid gap-7 xl:grid-cols-[1.2fr_0.8fr]">
                            <div id="favorites">
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                            Keep close to your heart
                                        </p>
                                        <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                            My Favorite Places
                                        </h2>
                                    </div>
                                </div>
                                {favorites.length ? (
                                    <div className="divide-y divide-[#dce3dc] border-y border-[#dce3dc] bg-[#fffdf8]">
                                        {favorites.map((place) => (
                                            <article
                                                className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
                                                key={place.name}
                                            >
                                                <img
                                                    alt=""
                                                    className="h-16 w-20 shrink-0 object-cover sm:h-[72px] sm:w-24"
                                                    loading="lazy"
                                                    src={place.image}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-serif text-lg text-[#123d36]">
                                                        {place.name}
                                                    </h3>
                                                    <p className="mt-1 flex items-center gap-1 text-xs text-[#71807a]">
                                                        <Icon
                                                            className="h-3 w-3"
                                                            name="pin"
                                                        />
                                                        {place.location}
                                                    </p>
                                                </div>
                                                <button
                                                    aria-label={`Remove ${place.name} from favorites`}
                                                    className="rounded-sm p-2 text-[#71807a] transition hover:bg-[#f4f1e8] hover:text-[#123d36]"
                                                    onClick={() =>
                                                        setFavorites((saved) =>
                                                            saved.filter(
                                                                (item) =>
                                                                    item.name !==
                                                                    place.name,
                                                            ),
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    <Icon name="trash" />
                                                </button>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-y border-[#dce3dc] bg-[#fffdf8] px-5 py-8 text-center">
                                        <p className="text-sm text-[#71807a]">
                                            You haven&apos;t saved any places
                                            yet.
                                        </p>
                                        <Link
                                            className="mt-4 inline-flex min-h-10 items-center justify-center bg-[#123d36] px-4 text-xs font-semibold text-white hover:bg-[#092c28]"
                                            href="/#discover"
                                        >
                                            Discover Places
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="mb-4">
                                    <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                        Pick up where you left off
                                    </p>
                                    <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                        Recently Viewed
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    {destinations.slice(1, 3).map((place) => (
                                        <article
                                            className="flex items-center gap-3 border border-[#dce3dc] bg-[#fffdf8] p-3"
                                            key={place.name}
                                        >
                                            <img
                                                alt=""
                                                className="h-14 w-16 shrink-0 object-cover"
                                                loading="lazy"
                                                src={place.image}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-[#34453f]">
                                                    {place.name}
                                                </h3>
                                                <p className="mt-1 text-xs text-[#71807a]">
                                                    {place.category}
                                                </p>
                                            </div>
                                            <Link
                                                aria-label={`View ${place.name}`}
                                                className="rounded-sm p-2 text-[#123d36] hover:bg-[#eaf0e9]"
                                                href="/#discover"
                                            >
                                                <Icon
                                                    className="h-4 w-4"
                                                    name="eye"
                                                />
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="mb-9 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
                            <div id="notifications">
                                <div className="mb-4">
                                    <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                        A little town news
                                    </p>
                                    <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                        Notifications
                                    </h2>
                                </div>
                                <div className="divide-y divide-[#dce3dc] border-y border-[#dce3dc] bg-[#fffdf8]">
                                    {notifications.map((notification) => (
                                        <article
                                            className="flex items-start gap-3 px-4 py-3.5"
                                            key={notification.title}
                                        >
                                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf0e9] text-[#123d36]">
                                                <Icon
                                                    className="h-4 w-4"
                                                    name={notification.icon}
                                                />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-[#34453f]">
                                                    {notification.title}
                                                </h3>
                                                <p className="mt-1 text-xs leading-5 text-[#71807a]">
                                                    {notification.detail}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <p className="mb-1 text-[10px] font-semibold tracking-[0.17em] text-[#bd8b3d] uppercase">
                                        Your account
                                    </p>
                                    <h2 className="font-serif text-2xl font-normal text-[#123d36]">
                                        Profile Summary
                                    </h2>
                                </div>
                                <article className="border border-[#dce3dc] bg-[#fffdf8] p-5">
                                    <div className="flex items-center gap-4 border-b border-[#dce3dc] pb-4">
                                        <Avatar
                                            image={user.avatar}
                                            name={user.name}
                                        />
                                        <div className="min-w-0">
                                            <h3 className="truncate font-serif text-xl text-[#123d36]">
                                                {user.name}
                                            </h3>
                                            <p className="mt-1 truncate text-xs text-[#71807a]">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 py-4 text-xs">
                                        <span className="text-[#71807a]">
                                            Member Since
                                        </span>
                                        <span className="text-right font-medium text-[#34453f]">
                                            {memberSince}
                                        </span>
                                    </div>
                                    <Link
                                        className="inline-flex min-h-10 w-full items-center justify-between border-t border-[#dce3dc] pt-3 text-sm font-semibold text-[#123d36]"
                                        href="/profile"
                                    >
                                        View Profile{' '}
                                        <Icon
                                            className="h-4 w-4 text-[#bd8b3d]"
                                            name="arrow"
                                        />
                                    </Link>
                                </article>
                            </div>
                        </section>

                        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dce3dc] py-5 text-xs text-[#71807a]">
                            <span>Abuyog Tourism &amp; Heritage Portal</span>
                            <span className="flex items-center gap-1.5">
                                <Icon className="h-3.5 w-3.5" name="clock" />
                                Your next discovery awaits.
                            </span>
                        </footer>
                    </main>
                </div>
            </div>
        </>
    );
}
