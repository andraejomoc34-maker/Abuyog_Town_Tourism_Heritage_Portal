import { Head, Link } from '@inertiajs/react';
import { Search, Store, Utensils } from 'lucide-react';
import { useMemo, useState } from 'react';
import PortalLogo from '../../components/PortalLogo';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type Source = {
    label: string;
    url: string;
};

type FoodImageData = {
    url: string;
    alt: string;
    credit: string;
    source_url: string;
    license_url: string;
    license_label: string;
};

type FoodEntry = {
    name: string;
    description: string;
    provenance: string;
    verification_status: 'Partially verified' | 'Needs verification';
    sources: Source[];
    image: FoodImageData | null;
};

type FoodBusiness = {
    name: string;
    category: string;
    address: string | null;
    rating: number | null;
    review_count: number | null;
    image_url: string | null;
    verification_status:
        | 'Needs verification'
        | 'Partially verified'
        | 'Verified';
    google_maps_url: string;
};

type LocalFoodsProps = {
    businesses: FoodBusiness[];
    foods: FoodEntry[];
};

function BusinessPhoto({
    businessName,
    imageUrl,
}: {
    businessName: string;
    imageUrl: string | null;
}) {
    const [imageFailed, setImageFailed] = useState(false);

    if (imageUrl && !imageFailed) {
        return (
            <img
                alt={`Supplied photo for ${businessName}`}
                className="mb-4 aspect-[16/7] w-full rounded-xl object-cover"
                decoding="async"
                loading="lazy"
                onError={() => setImageFailed(true)}
                src={imageUrl}
            />
        );
    }

    return (
        <div className="mb-4 flex aspect-[16/7] items-center justify-center rounded-xl border border-dashed border-[#d8d1c3] bg-[#f8f5ee] text-[#8b672c]">
            <div className="text-center">
                <Store aria-hidden="true" className="mx-auto h-7 w-7" />
                <p className="mt-2 text-xs">Photo not available</p>
            </div>
        </div>
    );
}

function FoodPhoto({
    foodName,
    image,
}: {
    foodName: string;
    image: FoodImageData | null;
}) {
    const [imageFailed, setImageFailed] = useState(false);
    const hasImage = image !== null && !imageFailed;

    return (
        <figure className="mb-4">
            {hasImage ? (
                <img
                    alt={image.alt}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                    decoding="async"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    src={image.url}
                />
            ) : (
                <div
                    aria-label={`Photo unavailable for ${foodName}`}
                    className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-[#d8d1c3] bg-[#f8f5ee] text-[#8b672c]"
                    role="img"
                >
                    <div className="text-center">
                        <Utensils
                            aria-hidden="true"
                            className="mx-auto h-7 w-7"
                        />
                        <p className="mt-2 text-xs">Photo not available</p>
                    </div>
                </div>
            )}
            {hasImage && (
                <figcaption className="mt-2 text-[10px] text-[#718078]">
                    Photo:{' '}
                    <a
                        className="underline underline-offset-2"
                        href={image.source_url}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {image.credit}
                    </a>
                    {' · '}
                    <a
                        className="underline underline-offset-2"
                        href={image.license_url}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {image.license_label}
                    </a>
                </figcaption>
            )}
        </figure>
    );
}

function PageNavigation() {
    return (
        <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-6 py-6 text-white lg:px-10">
            <Link href="/" className="flex items-center gap-3">
                <PortalLogo />
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
                    href="/discover"
                >
                    Discover
                </Link>
                <Link
                    aria-current="page"
                    className="text-white"
                    href="/local-foods"
                >
                    Local Foods
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/resorts"
                >
                    Resorts
                </Link>
            </nav>
            <PublicMobileMenu desktopNavigation />
        </header>
    );
}

export default function LocalFoods({ businesses, foods }: LocalFoodsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All categories');
    const categories = useMemo(
        () => [
            'All categories',
            ...new Set(businesses.map(({ category }) => category)),
        ],
        [businesses],
    );
    const filteredBusinesses = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

        return businesses.filter((business) => {
            const matchesCategory =
                activeCategory === 'All categories' ||
                business.category === activeCategory;
            const matchesSearch =
                normalizedQuery.length === 0 ||
                business.name.toLocaleLowerCase().includes(normalizedQuery);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, businesses, searchQuery]);

    return (
        <>
            <Head title="Local Foods & Restaurants" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <section className="flex min-h-[360px] flex-col bg-[#123d36] text-white sm:min-h-[400px]">
                    <PageNavigation />
                    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-12 lg:px-10 lg:pb-16">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                            TASTE ABUYOG
                        </p>
                        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-normal sm:text-6xl">
                            Local Foods &amp; Restaurants
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                            Discover Filipino meals, cafés, bakeries, local
                            delicacies, and food businesses in Abuyog, Leyte.
                            Listing details are identified as unverified until
                            confirmed from reliable public sources.
                        </p>
                    </div>
                </section>

                <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-10">
                    <section aria-labelledby="regional-foods-heading">
                        <div className="mb-8 max-w-3xl">
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                REGIONAL FOODWAYS
                            </p>
                            <h2
                                className="mt-3 font-serif text-3xl font-normal sm:text-4xl"
                                id="regional-foods-heading"
                            >
                                Traditional Leyte foods and delicacies
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-[#64736c]">
                                Some foods below are associated with Eastern
                                Visayas or Leyte, while others are enjoyed
                                across the Philippines. A regional association
                                is not a claim of origin in Abuyog.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {foods.map((food) => (
                                <article
                                    className="flex h-full flex-col rounded-2xl border border-[#e3ddcf] bg-white p-5 shadow-[0_12px_35px_rgba(23,60,52,0.04)]"
                                    key={food.name}
                                >
                                    <FoodPhoto
                                        foodName={food.name}
                                        image={food.image}
                                    />
                                    <h3 className="font-serif text-xl">
                                        {food.name}
                                    </h3>
                                    <p className="mt-2 flex-1 text-sm leading-6 text-[#64736c]">
                                        {food.description}
                                    </p>
                                    <p className="mt-4 text-xs font-medium text-[#52645b]">
                                        {food.provenance}
                                    </p>
                                    <p className="mt-3 text-xs font-semibold text-[#826124]">
                                        {food.verification_status}
                                    </p>
                                    {food.sources.length > 0 && (
                                        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#eee8dc] pt-3">
                                            {food.sources.map((source) => (
                                                <li key={source.url}>
                                                    <a
                                                        className="text-xs text-[#245548] underline decoration-[#bd8b3d] underline-offset-2 hover:text-[#8b672c] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d]"
                                                        href={source.url}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {source.label}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            ))}
                        </div>
                        <p className="mt-5 text-xs text-[#718078]">
                            Food descriptions are based on the cited references;
                            sources checked October 26, 2026. Local recipes,
                            cultural histories, and photographs should be
                            confirmed with local sources before publication.
                        </p>
                    </section>

                    <section
                        aria-labelledby="businesses-heading"
                        className="mt-16 sm:mt-20"
                    >
                        <div className="mb-8 max-w-3xl">
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                EAT &amp; EXPLORE
                            </p>
                            <h2
                                className="mt-3 font-serif text-3xl font-normal sm:text-4xl"
                                id="businesses-heading"
                            >
                                Food businesses in Abuyog
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-[#64736c]">
                                These names were supplied for the directory.
                                Addresses, categories, ratings, menus, hours,
                                photos, and exact map listings have not yet been
                                independently verified.
                            </p>
                        </div>

                        <div className="mb-7 grid gap-4 sm:grid-cols-[minmax(0,1fr)_15rem]">
                            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#dedfd8] bg-white px-4 text-[#718078] focus-within:border-[#bd8b3d]">
                                <Search
                                    aria-hidden="true"
                                    className="h-4 w-4 shrink-0"
                                />
                                <span className="sr-only">
                                    Search businesses by name
                                </span>
                                <input
                                    aria-controls="food-business-list"
                                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#173c34] outline-none placeholder:text-[#718078] focus:ring-0"
                                    onChange={(event) =>
                                        setSearchQuery(event.target.value)
                                    }
                                    placeholder="Search business names"
                                    type="search"
                                    value={searchQuery}
                                />
                            </label>
                            <label className="flex min-h-12 items-center rounded-xl border border-[#dedfd8] bg-white px-4 focus-within:border-[#bd8b3d]">
                                <span className="sr-only">
                                    Filter businesses by category
                                </span>
                                <select
                                    aria-label="Filter businesses by category"
                                    className="w-full border-0 bg-transparent py-3 text-sm text-[#173c34] outline-none focus:ring-0"
                                    onChange={(event) =>
                                        setActiveCategory(event.target.value)
                                    }
                                    value={activeCategory}
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <p
                            aria-live="polite"
                            className="mb-4 text-sm text-[#64736c]"
                            role="status"
                        >
                            Showing {filteredBusinesses.length} of{' '}
                            {businesses.length} businesses
                        </p>
                        {filteredBusinesses.length > 0 ? (
                            <div
                                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                                id="food-business-list"
                            >
                                {filteredBusinesses.map((business) => (
                                    <article
                                        className="flex min-h-64 flex-col rounded-2xl border border-[#e3ddcf] bg-white p-5 shadow-[0_12px_35px_rgba(23,60,52,0.04)] transition hover:border-[#d99d4b] hover:shadow-[0_18px_35px_rgba(23,60,52,0.09)]"
                                        key={business.name}
                                    >
                                        <BusinessPhoto
                                            businessName={business.name}
                                            imageUrl={business.image_url}
                                        />
                                        <div className="flex-1">
                                            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#8b672c] uppercase">
                                                {business.category}
                                            </p>
                                            <h3 className="mt-2 font-serif text-xl leading-snug">
                                                {business.name}
                                            </h3>
                                        </div>
                                        <div className="mt-5 flex justify-end border-t border-[#eee8dc] pt-4">
                                            <a
                                                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#d99d4b] px-3 text-xs font-semibold text-[#173c34] transition hover:bg-[#f6e5bd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173c34]"
                                                href={business.google_maps_url}
                                                rel="noreferrer"
                                                target="_blank"
                                            >
                                                {business.google_maps_url.includes(
                                                    '/maps/place/',
                                                )
                                                    ? 'View on Google Maps'
                                                    : 'Search Google Maps'}
                                            </a>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="rounded-2xl border border-[#e3ddcf] bg-white px-6 py-12 text-center"
                                id="food-business-list"
                            >
                                <Search
                                    aria-hidden="true"
                                    className="mx-auto h-8 w-8 text-[#8b672c]"
                                />
                                <h3 className="mt-4 font-serif text-xl">
                                    No businesses match your search
                                </h3>
                                <p className="mt-2 text-sm text-[#64736c]">
                                    Try another name or choose a different
                                    category.
                                </p>
                                <button
                                    className="mt-4 rounded-lg border border-[#173c34] px-4 py-2 text-sm font-semibold text-[#173c34] transition hover:bg-[#173c34] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d]"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setActiveCategory('All categories');
                                    }}
                                    type="button"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                        <p className="mt-5 text-xs leading-5 text-[#718078]">
                            Map links open a Google Maps search for the supplied
                            business name and Abuyog, Leyte; they are not
                            confirmed business profiles. No ratings, hours,
                            phone numbers, menus, or business photographs are
                            displayed without verification.
                        </p>
                    </section>
                </main>
            </div>
        </>
    );
}
