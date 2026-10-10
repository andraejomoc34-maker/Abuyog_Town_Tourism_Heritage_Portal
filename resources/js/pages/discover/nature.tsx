import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

const categories = [
    'All Destinations',
    'Waterfalls',
    'Beaches & Shoreline',
    'Rivers & Nature',
    'Resorts',
] as const;

type DestinationCategory = (typeof categories)[number];

const places = [
    {
        title: 'Coastal Landscapes',
        category: 'Beaches & Shoreline',
        filterCategories: ['Beaches & Shoreline'],
        location: 'Abuyog, Leyte',
        description:
            'Discover open shoreline and coastal scenery. Check local guidance before planning a visit.',
        image: '/island-paradise-3.jpg',
        alt: 'Coastal scenery used as a sample nature destination image',
        href: '/discover',
    },
    {
        title: 'Castañas Resort & Riverside',
        category: 'Rivers & Nature',
        filterCategories: ['Rivers & Nature', 'Resorts'],
        location: 'Abuyog area, Leyte',
        description:
            'Find a quieter pace among the waterways and green landscapes of the area.',
        image: '/abuyog-2.jpg',
        alt: 'Green landscape used as a sample riverside destination image',
        href: '/resorts',
    },
    {
        title: 'Valida Mountain Resort',
        category: 'Resorts',
        filterCategories: ['Resorts'],
        location: 'Abuyog area, Leyte',
        description:
            'Explore the region’s natural scenery. Confirm trail access and conditions locally.',
        image: '/abuyog-4.jpg',
        alt: 'Natural landscape used as a sample mountain destination image',
        href: '/resorts',
    },
    {
        title: 'Maliguicay Falls',
        category: 'Waterfalls',
        filterCategories: ['Waterfalls'],
        location: 'Abuyog area, Leyte',
        description:
            'Use this sample listing as a starting point for finding waterfalls and nearby nature spots.',
        image: '/abuyog-9.jpg',
        alt: 'Tropical greenery used as a sample waterfall destination image',
        href: '/resorts',
    },
];

function PageNavigation() {
    return (
        <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-6 py-6 lg:px-10">
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
                aria-label="Main navigation"
                className="hidden items-center gap-6 text-xs font-medium text-white/80 md:flex"
            >
                <Link className="transition hover:text-[#e4b866]" href="/">
                    Home
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#discover"
                >
                    Discover
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#heritage"
                >
                    Heritage
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#culture"
                >
                    Culture
                </Link>
            </nav>
            <Link
                className="hidden shrink-0 rounded-none bg-white px-4 py-2.5 text-xs font-semibold text-[#173c34] transition hover:bg-[#f6e5bd] sm:inline-flex"
                href="/"
            >
                Back to Discover
            </Link>
            <PublicMobileMenu desktopNavigation />
        </header>
    );
}

export default function Nature() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] =
        useState<DestinationCategory>('All Destinations');
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const filteredPlaces = places.filter((place) => {
        const matchesCategory =
            activeCategory === 'All Destinations' ||
            place.filterCategories.includes(activeCategory);
        const matchesSearch =
            normalizedQuery.length === 0 ||
            `${place.title} ${place.category} ${place.location} ${place.description}`
                .toLocaleLowerCase()
                .includes(normalizedQuery);

        return matchesCategory && matchesSearch;
    });

    function clearFilters() {
        setSearchQuery('');
        setActiveCategory('All Destinations');
    }

    return (
        <>
            <Head title="Natural Wonders of Abuyog" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <section className="relative flex min-h-[390px] flex-col bg-[#123d36] text-white sm:min-h-[440px]">
                    <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        src="/island-paradise-3.jpg"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,34,.9)_0%,rgba(11,50,43,.58)_55%,rgba(8,36,32,.25)_100%),linear-gradient(0deg,rgba(8,36,32,.72)_0%,transparent_65%)]" />
                    <PageNavigation />
                    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-12 lg:px-10 lg:pb-16">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                            NATURE &amp; LANDSCAPE
                        </p>
                        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-normal sm:text-6xl">
                            Natural Wonders of Abuyog
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                            Explore the natural beauty and landscapes that make
                            Abuyog special.
                        </p>
                    </div>
                </section>

                <main className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:px-10">
                    <div className="mb-10 max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                            EXPLORE THE OUTDOORS
                        </p>
                        <h2 className="mt-3 font-serif text-3xl font-normal text-[#173c34] sm:text-4xl">
                            Find your kind of escape.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#718078]">
                            Discover waterfalls, coastal scenery, riverside
                            destinations, and outdoor escapes around Abuyog,
                            Leyte.
                        </p>
                    </div>
                    <div className="mb-8 space-y-5">
                        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#dedfd8] bg-white px-4 text-[#718078] focus-within:border-[#bd8b3d]">
                            <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
                            <input
                                aria-label="Search destinations in Abuyog"
                                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#173c34] outline-none placeholder:text-[#718078] focus:ring-0"
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search destinations in Abuyog…"
                                type="search"
                                value={searchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <button
                                    aria-label="Clear search"
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#718078] transition hover:bg-[#f0eadc] hover:text-[#173c34]"
                                    onClick={() => setSearchQuery('')}
                                    type="button"
                                >
                                    <X aria-hidden="true" className="h-4 w-4" />
                                </button>
                            )}
                        </label>
                        <div
                            aria-label="Filter destinations by category"
                            className="flex flex-wrap gap-2"
                            role="group"
                        >
                            {categories.map((category) => (
                                <button
                                    aria-pressed={activeCategory === category}
                                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                                        activeCategory === category
                                            ? 'border-[#173c34] bg-[#173c34] text-white'
                                            : 'border-[#dedfd8] bg-white text-[#53645d] hover:border-[#bd8b3d] hover:text-[#173c34]'
                                    }`}
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    type="button"
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    {filteredPlaces.length > 0 ? (
                        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPlaces.map((place) => (
                                <article
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(31,54,44,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(31,54,44,.15)]"
                                    key={place.title}
                                >
                                    <div className="h-56 shrink-0 overflow-hidden bg-[#e8ede7]">
                                        <img
                                            alt={place.alt}
                                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                            loading="lazy"
                                            src={place.image}
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <p className="text-[10px] font-bold tracking-[0.16em] text-[#bd8b3d]">
                                            {place.category}
                                        </p>
                                        <h3 className="mt-2 font-serif text-2xl text-[#173c34]">
                                            {place.title}
                                        </h3>
                                        <p className="mt-3 flex items-center gap-2 text-xs text-[#718078]">
                                            ⌖ {place.location}
                                        </p>
                                        <p className="mt-4 min-h-14 flex-1 text-sm leading-6 text-[#718078]">
                                            {place.description}
                                        </p>
                                        <Link
                                            className="mt-5 inline-flex items-center text-xs font-bold tracking-[0.12em] text-[#9b6a28] transition hover:text-[#173c34]"
                                            href={place.href}
                                        >
                                            VIEW DETAILS{' '}
                                            <span className="ml-2 text-base">
                                                {'\u2197'}
                                            </span>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#dedfd8] bg-white px-6 py-12 text-center">
                            <h3 className="font-serif text-2xl text-[#173c34]">
                                No destinations found
                            </h3>
                            <p className="mt-2 text-sm text-[#718078]">
                                Try another search or clear the filters to see all destinations.
                            </p>
                            <button
                                className="mt-5 inline-flex items-center rounded-full bg-[#173c34] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#24564b]"
                                onClick={clearFilters}
                                type="button"
                            >
                                Show all destinations
                            </button>
                        </div>
                    )}
                </main>
                <footer className="border-t border-[#dedfd8] bg-[#f0eadc] px-6 py-8 lg:px-10">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-[#718078]">
                        <span>ABUYOG TOURISM · TOURISM &amp; HERITAGE</span>
                        <Link
                            className="font-semibold text-[#173c34] hover:text-[#9b6a28]"
                            href="/"
                        >
                            ← Back to Discover
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
