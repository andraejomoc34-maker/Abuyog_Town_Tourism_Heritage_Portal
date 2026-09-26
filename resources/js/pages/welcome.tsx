import { Head, Link, router, usePage } from '@inertiajs/react';

const experiences = [
    {
        icon: '\u{1F334}',
        title: 'Nature',
        description: 'Explore beautiful natural destinations.',
    },
    {
        icon: '\u{1F3DB}\u{FE0F}',
        title: 'Heritage',
        description: "Discover Abuyog's stories and history.",
    },
    {
        icon: '\u{1F3AD}',
        title: 'Culture',
        description: 'Experience local traditions and festivals.',
    },
    {
        icon: '\u{2764}\u{FE0F}',
        title: 'Community',
        description: 'Meet the people and stories of Abuyog.',
    },
];

const destinations = [
    {
        title: 'Natural Wonders',
        description:
            'Find quiet shores, green trails, and landscapes shaped by island life.',
        image: 'island-paradise-3.jpg',
        alt: 'Tropical turquoise coastline with a sandy beach',
    },
    {
        title: 'Heritage & History',
        description:
            'Walk through the places and memories that continue to shape Abuyog.',
        image: 'balsa-kafe.jpg',
        alt: 'Historic temple surrounded by warm evening light',
    },
    {
        title: 'Culture & Festival',
        description:
            'Share the color, rhythm, food, and welcome of local celebrations.',
        image: 'Abuyog-5.jpg',
        alt: 'Colorful cultural celebration with traditional decorations',
    },
];

const food = [
    {
        name: 'Kinilaw na Isda',
        description:
            'Fresh catch brightened with native citrus, ginger, and coconut.',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
        alt: 'Fresh seafood dish served with citrus and herbs',
    },
    {
        name: 'Bibingka',
        description:
            'A beloved rice cake with the warmth of coconut and local tradition.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85',
        alt: 'Golden traditional rice cakes on a serving plate',
    },
    {
        name: 'Coconut Delights',
        description:
            "Simple, generous flavors inspired by Leyte's abundant coconut groves.",
        image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=85',
        alt: 'Fresh coconut and tropical ingredients on a table',
    },
];

const travelGuide = [
    {
        icon: '\u{1F68D}',
        title: 'How to Get Here',
        text: 'Start your route to Abuyog with ease.',
    },
    {
        icon: '\u{1F5FA}\u{FE0F}',
        title: 'Map & Directions',
        text: 'Navigate your way through Leyte.',
    },
    {
        icon: '\u{1F3E8}',
        title: 'Where to Stay',
        text: 'Rest well and stay a little longer.',
    },
    {
        icon: '\u{1F4CD}',
        title: 'Places to Visit',
        text: 'Build a day worth remembering.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Abuyog Town Tourism & Heritage Portal" />
            <div className="min-h-screen overflow-hidden bg-[#fbf8f0] text-[#173c34]">
                <section className="relative flex min-h-[680px] flex-col bg-[#123d36] text-white sm:min-h-[730px]">
                    <div className="absolute inset-0 bg-[url('https://i.ytimg.com/vi/lcVixSzFRmM/maxresdefault.jpg')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,34,.9)_0%,rgba(11,50,43,.55)_48%,rgba(8,36,32,.25)_100%),linear-gradient(0deg,rgba(8,36,32,.82)_0%,transparent_55%)]" />
                    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4b866] text-xl text-[#e4b866]">
                                {'\u2726'}
                            </span>
                            <span>
                                <strong className="block text-sm tracking-[0.24em]">
                                    ABUYOG TOURISM
                                </strong>
                                <small className="mt-1 block text-[10px] tracking-[0.2em] text-white/65">
                                    TOURISM &amp; HERITAGE
                                </small>
                            </span>
                        </Link>
                        <nav
                            className="hidden items-center gap-7 text-xs font-medium text-white/80 lg:flex"
                            aria-label="Main navigation"
                        >
                            <a className="text-white" href="#home">
                                Home
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#welcome"
                            >
                                About
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#discover"
                            >
                                Tourist Spots
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#discover"
                            >
                                Discover
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#heritage"
                            >
                                Heritage
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#culture"
                            >
                                Culture
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#history"
                            >
                                History
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#festival"
                            >
                                Festivals
                            </a>
                            <a
                                className="transition hover:text-[#e4b866]"
                                href="#travel-guide"
                            >
                                Travel Guide
                            </a>
                            {auth.user && (
                                <>
                                    <Link
                                        className="transition hover:text-[#e4b866]"
                                        href="/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        className="transition hover:text-[#e4b866]"
                                        href="/profile"
                                    >
                                        Profile
                                    </Link>
                                </>
                            )}
                        </nav>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            {auth.user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="rounded-full px-4 py-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                                    >
                                        {auth.user.name}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className="rounded-full bg-white px-5 py-2.5 text-[#173c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f6e5bd]"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-full px-4 py-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-full bg-white px-5 py-2.5 text-[#173c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f6e5bd]"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </header>
                    <div
                        id="home"
                        className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 pt-16 pb-28 lg:px-10"
                    >
                        <div className="max-w-2xl">
                            <p className="mb-5 text-xs font-semibold tracking-[0.28em] text-[#e4b866]">
                                LEYTE{' '}
                                <span className="mx-2 text-white/50">
                                    {'\u2022'}
                                </span>{' '}
                                PHILIPPINES
                            </p>
                            <h1 className="max-w-xl font-serif text-6xl leading-[.92] font-normal tracking-[-.04em] sm:text-8xl lg:text-[8rem]">
                                DISCOVER
                                <br />
                                <span className="text-[#e4b866]">ABUYOG</span>
                            </h1>
                            <p className="mt-8 max-w-md text-base leading-7 text-white/80 sm:text-lg">
                                Experience the beauty, history, culture, and
                                heritage of Abuyog, Leyte.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <a
                                    href="#discover"
                                    className="rounded-full bg-[#d99d4b] px-6 py-3.5 text-sm font-semibold text-[#173c34] transition hover:-translate-y-1 hover:bg-[#edbd73]"
                                >
                                    Explore Abuyog{' '}
                                    <span className="ml-2">{'\u2197'}</span>
                                </a>
                                <a
                                    href="#heritage"
                                    className="rounded-full border border-white/45 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-white hover:bg-white/10"
                                >
                                    Explore Heritage
                                </a>
                            </div>
                        </div>
                    </div>
                    <a
                        href="#welcome"
                        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.25em] text-white/65"
                        aria-label="Scroll to welcome section"
                    >
                        <span>SCROLL TO EXPLORE</span>
                        <span className="h-10 w-px bg-[#e4b866]" />
                    </a>
                </section>

                <section
                    id="welcome"
                    className="bg-white px-6 py-20 sm:py-28 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                    WELCOME TO ABUYOG
                                </p>
                                <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight font-normal text-[#173c34] sm:text-5xl">
                                    Where nature meets heritage.
                                </h2>
                            </div>
                            <p className="max-w-xl text-base leading-8 text-[#68766f]">
                                Abuyog is a place of natural beauty, living
                                history, vibrant culture, and warm hospitality.
                                Come closer to the landscapes, traditions, and
                                welcoming community that make this corner of
                                Leyte unforgettable.
                            </p>
                        </div>
                        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {experiences.map((experience) => (
                                <article
                                    key={experience.title}
                                    className="border-t border-[#dedfd8] pt-5 transition hover:-translate-y-1"
                                >
                                    <span className="text-3xl">
                                        {experience.icon}
                                    </span>
                                    <h3 className="mt-5 text-lg font-semibold text-[#173c34]">
                                        {experience.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718078]">
                                        {experience.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="discover"
                    className="bg-[#f0eadc] px-6 py-20 sm:py-28 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                    SEE MORE OF THE ISLAND
                                </p>
                                <h2 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-5xl">
                                    Discover Abuyog
                                </h2>
                            </div>
                            <p className="max-w-md text-sm leading-7 text-[#718078]">
                                Find destinations and experiences that showcase
                                the natural beauty and cultural identity of
                                Abuyog.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-6 lg:grid-cols-3">
                            {destinations.map((destination) => (
                                <article
                                    key={destination.title}
                                    className="group overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(31,54,44,.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(31,54,44,.15)]"
                                >
                                    <div className="h-64 overflow-hidden">
                                        <img
                                            src={destination.image}
                                            alt={destination.alt}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-serif text-2xl text-[#173c34]">
                                            {destination.title}
                                        </h3>
                                        <p className="mt-3 min-h-14 text-sm leading-6 text-[#718078]">
                                            {destination.description}
                                        </p>
                                        <a
                                            href="#heritage"
                                            className="mt-5 inline-flex items-center text-xs font-bold tracking-[0.12em] text-[#9b6a28] transition group-hover:text-[#173c34]"
                                        >
                                            EXPLORE{' '}
                                            <span className="ml-2 text-base">
                                                {'\u2197'}
                                            </span>
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="heritage"
                    className="bg-[#123d36] px-6 py-20 text-white sm:py-28 lg:px-10"
                >
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
                        <div className="relative">
                            <div className="absolute -right-5 -bottom-5 h-32 w-32 rounded-full border border-[#d99d4b]/60" />
                            <img
                                src="abuyog-6.jpeg"
                                alt="Historic stone architecture surrounded by tropical greenery"
                                className="relative h-[430px] w-full rounded-2xl object-cover shadow-2xl sm:h-[520px]"
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                                HISTORY &amp; HERITAGE
                            </p>
                            <h2
                                id="history"
                                className="mt-4 font-serif text-5xl leading-tight font-normal sm:text-6xl"
                            >
                                Where history lives.
                            </h2>
                            <p className="mt-6 max-w-lg text-base leading-8 text-white/70">
                                Discover the places, people, traditions, and
                                stories that helped shape Abuyog through the
                                years.
                            </p>
                            <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
                                <div>
                                    <span className="text-2xl">
                                        {'\u{1F3DB}\u{FE0F}'}
                                    </span>
                                    <h3 className="mt-2 font-semibold">
                                        Heritage Sites
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-white/60">
                                        Explore historically meaningful places.
                                    </p>
                                </div>
                                <div>
                                    <span className="text-2xl">
                                        {'\u{1F4D6}'}
                                    </span>
                                    <h3 className="mt-2 font-semibold">
                                        History
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-white/60">
                                        Follow the story of Abuyog through time.
                                    </p>
                                </div>
                                <div>
                                    <span className="text-2xl">
                                        {'\u{1F3A8}'}
                                    </span>
                                    <h3 className="mt-2 font-semibold">
                                        Culture
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-white/60">
                                        Learn about traditions and local
                                        identity.
                                    </p>
                                </div>
                            </div>
                            <a
                                href="#culture"
                                className="mt-10 inline-flex rounded-full bg-[#d99d4b] px-6 py-3.5 text-sm font-semibold text-[#173c34] transition hover:-translate-y-1 hover:bg-[#edbd73]"
                            >
                                Explore Heritage{' '}
                                <span className="ml-2">{'\u2197'}</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section
                    id="festival"
                    className="relative overflow-hidden px-6 py-24 lg:px-10"
                >
                    <div className="absolute inset-0 bg-[url('https://old.dailyguardian.com.ph/wp-content/uploads/2023/01/Pintados_-_Kasadyaan_Festival.jpg')] bg-cover bg-center" />
                    <div className="absolute inset-0 bg-[#0c352e]/75" />
                    <div className="relative mx-auto max-w-4xl text-center text-white">
                        <p className="text-xs font-bold tracking-[0.25em] text-[#f0c978]">
                            A CELEBRATION OF IDENTITY
                        </p>
                        <h2 className="mt-5 font-serif text-5xl font-normal sm:text-7xl">
                            Experience the
                            <br />
                            <span className="text-[#f0c978]">
                                Buyogan Festival
                            </span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80">
                            Discover the traditions, performances, celebrations,
                            and cultural identity of Abuyog.
                        </p>
                        <a
                            href="#culture"
                            className="mt-9 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#173c34] transition hover:-translate-y-1 hover:bg-[#f6e5bd]"
                        >
                            View Festival{' '}
                            <span className="ml-2">{'\u2197'}</span>
                        </a>
                    </div>
                </section>

                <section
                    id="culture"
                    className="bg-[#fbf8f0] px-6 py-20 sm:py-28 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                    FROM OUR TABLE
                                </p>
                                <h2 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-5xl">
                                    Taste Abuyog
                                </h2>
                            </div>
                            <span className="hidden text-4xl sm:block">
                                {'\u{1F965}'}
                            </span>
                        </div>
                        <div className="mt-12 grid gap-6 md:grid-cols-3">
                            {food.map((item) => (
                                <article key={item.name} className="group">
                                    <div className="overflow-hidden rounded-2xl">
                                        <img
                                            src={item.image}
                                            alt={item.alt}
                                            className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="mt-5 font-serif text-2xl text-[#173c34]">
                                        {item.name}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718078]">
                                        {item.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section
                    id="travel-guide"
                    className="border-t border-[#e3ddcf] bg-white px-6 py-20 sm:py-24 lg:px-10"
                >
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                MAKE YOUR WAY HERE
                            </p>
                            <h2 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-5xl">
                                Plan Your Journey
                            </h2>
                        </div>
                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {travelGuide.map((item) => (
                                <a
                                    key={item.title}
                                    href="#home"
                                    className="rounded-2xl border border-[#e3ddcf] p-6 transition hover:-translate-y-1 hover:border-[#bd8b3d] hover:shadow-lg"
                                >
                                    <span className="text-3xl">
                                        {item.icon}
                                    </span>
                                    <h3 className="mt-5 font-semibold text-[#173c34]">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-[#718078]">
                                        {item.text}
                                    </p>
                                    <span className="mt-5 block text-xs font-bold tracking-widest text-[#9b6a28]">
                                        LEARN MORE {'\u2192'}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#f0eadc] px-6 py-20 text-center sm:py-24">
                    <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                        YOUR NEXT STORY AWAITS
                    </p>
                    <h2 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-6xl">
                        Ready to discover Abuyog?
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#718078]">
                        Explore destinations, discover history, experience
                        culture, and create memories in Abuyog, Leyte.
                    </p>
                    <Link
                        href="/register"
                        className="mt-8 inline-flex rounded-full bg-[#123d36] px-7 py-4 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#1b574b]"
                    >
                        Create Your Account{' '}
                        <span className="ml-2 text-[#e4b866]">{'\u2197'}</span>
                    </Link>
                </section>

                <footer className="bg-[#092c28] px-6 py-14 text-white lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                            <div>
                                <Link
                                    href="/"
                                    className="flex items-center gap-3"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4b866] text-xl text-[#e4b866]">
                                        {'\u2726'}
                                    </span>
                                    <span>
                                        <strong className="block text-sm tracking-[0.24em]">
                                            ABUYOG TOURISM
                                        </strong>
                                        <small className="mt-1 block text-[10px] tracking-[0.2em] text-white/55">
                                            Tourism &amp; Heritage Portal
                                        </small>
                                    </span>
                                </Link>
                                <p className="mt-6 max-w-xs text-sm leading-6 text-white/55">
                                    Discover the beauty, stories, and spirit of
                                    Abuyog, Leyte.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold tracking-[0.18em] text-[#e4b866]">
                                    EXPLORE
                                </h3>
                                <div className="mt-5 grid gap-3 text-sm text-white/65">
                                    <a
                                        href="#home"
                                        className="hover:text-white"
                                    >
                                        Home
                                    </a>
                                    <a
                                        href="#discover"
                                        className="hover:text-white"
                                    >
                                        Discover
                                    </a>
                                    <a
                                        href="#heritage"
                                        className="hover:text-white"
                                    >
                                        Heritage
                                    </a>
                                    <a
                                        href="#history"
                                        className="hover:text-white"
                                    >
                                        History
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold tracking-[0.18em] text-[#e4b866]">
                                    EXPERIENCE
                                </h3>
                                <div className="mt-5 grid gap-3 text-sm text-white/65">
                                    <a
                                        href="#festival"
                                        className="hover:text-white"
                                    >
                                        Festivals
                                    </a>
                                    <a
                                        href="#culture"
                                        className="hover:text-white"
                                    >
                                        Food
                                    </a>
                                    <a
                                        href="#travel-guide"
                                        className="hover:text-white"
                                    >
                                        Travel Guide
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold tracking-[0.18em] text-[#e4b866]">
                                    ACCOUNT
                                </h3>
                                <div className="mt-5 grid gap-3 text-sm text-white/65">
                                    <Link
                                        href="/login"
                                        className="hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="hover:text-white"
                                    >
                                        Sign up
                                    </Link>
                                    <p className="pt-2 text-white/45">
                                        Abuyog, Leyte,
                                        <br />
                                        Philippines
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                {'\u00A9'} 2026 Abuyog Town Tourism &amp;
                                Heritage Portal.
                            </span>
                            <span>All rights reserved.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
