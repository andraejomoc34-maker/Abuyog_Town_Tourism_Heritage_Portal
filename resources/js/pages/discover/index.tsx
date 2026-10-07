import { Head, Link } from '@inertiajs/react';
import {
    Compass,
    Flower2,
    Landmark,
    MapPinned,
    Salad,
    Theater,
    Trees,
} from 'lucide-react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type DiscoverCategory = {
    name: string;
    href: string;
    description: string;
    icon: typeof Trees;
    accent: string;
};

const categories: DiscoverCategory[] = [
    {
        name: 'NATURE',
        href: '/discover/nature',
        description: 'Discover natural wonders, coastal views, and outdoor escapes.',
        icon: Trees,
        accent: 'bg-[#e6f1ee]',
    },
    {
        name: 'HERITAGE',
        href: '/discover/heritage',
        description: 'Explore the stories and places that shape Abuyog’s past.',
        icon: Landmark,
        accent: 'bg-[#f9f1e6]',
    },
    {
        name: 'CULTURE',
        href: '/discover/culture',
        description: 'Celebrate traditions, local life, and community identity.',
        icon: Theater,
        accent: 'bg-[#f3efe7]',
    },
    {
        name: 'FESTIVALS & EVENTS',
        href: '/discover/culture',
        description: 'Experience local celebrations and memorable community events.',
        icon: Flower2,
        accent: 'bg-[#f4ebed]',
    },
    {
        name: 'LOCAL FOOD',
        href: '/discover',
        description: 'Sample signature dishes and local flavors from the town.',
        icon: Salad,
        accent: 'bg-[#f7efe2]',
    },
    {
        name: 'TOURIST SPOTS',
        href: '/discover',
        description: 'Browse recommended places to visit across the municipality.',
        icon: MapPinned,
        accent: 'bg-[#edf2ef]',
    },
];

export default function DiscoverIndex({
    touristSpots = [],
}: {
    touristSpots?: Array<{
        id: number;
        name: string;
        description?: string | null;
        location?: string | null;
        category?: string | null;
        image_url?: string | null;
    }>;
}) {
    return (
        <>
            <Head title="Discover Abuyog" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <header className="border-b border-[#e3ddcf] bg-[#123d36] text-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4b866] text-xl text-[#e4b866]">
                                ★
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
                        <Link
                            href="/"
                            className="hidden rounded-none bg-white px-4 py-2 text-xs font-semibold text-[#173c34] transition hover:bg-[#f6e5bd] sm:inline-flex"
                        >
                            Back to Home
                        </Link>
                        <PublicMobileMenu />
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
                    <div className="text-center">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                            DISCOVER THE TOWN
                        </p>
                        <h1 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-5xl">
                            DISCOVER ABUYOG
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#718078]">
                            Explore nature, heritage, culture, food, and experiences across Abuyog.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => {
                            const Icon = category.icon;

                            return (
                                <Link
                                    key={category.name}
                                    href={category.href}
                                    className="group overflow-hidden rounded-3xl border border-[#e3ddcf] bg-white p-6 shadow-[0_12px_35px_rgba(23,60,52,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#d99d4b] hover:shadow-[0_18px_35px_rgba(23,60,52,0.10)]"
                                >
                                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${category.accent}`}>
                                        <Icon className="h-6 w-6 text-[#173c34]" />
                                    </div>
                                    <h2 className="mt-5 font-serif text-2xl text-[#173c34]">
                                        {category.name}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-[#718078]">
                                        {category.description}
                                    </p>
                                    <span className="mt-5 inline-flex items-center text-xs font-bold tracking-[0.12em] text-[#9b6a28]">
                                        VIEW DETAILS <span className="ml-2">→</span>
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <section className="mt-12 rounded-3xl border border-[#e3ddcf] bg-[#f8f3e8] p-7">
                        <div className="flex items-center gap-3">
                            <Compass className="h-5 w-5 text-[#9b6a28]" />
                            <h2 className="font-serif text-3xl text-[#173c34]">
                                Explore by interest
                            </h2>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <Link href="/discover/nature" className="rounded-2xl border border-[#e3ddcf] bg-white p-4 text-sm font-medium text-[#173c34] transition hover:border-[#d99d4b]">
                                Nature
                            </Link>
                            <Link href="/discover/heritage" className="rounded-2xl border border-[#e3ddcf] bg-white p-4 text-sm font-medium text-[#173c34] transition hover:border-[#d99d4b]">
                                Heritage
                            </Link>
                            <Link href="/discover/culture" className="rounded-2xl border border-[#e3ddcf] bg-white p-4 text-sm font-medium text-[#173c34] transition hover:border-[#d99d4b]">
                                Culture
                            </Link>
                        </div>
                    </section>

                    {touristSpots.length > 0 && (
                        <section className="mt-12">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <h2 className="font-serif text-3xl text-[#173c34]">
                                    Featured destinations
                                </h2>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {touristSpots.map((spot) => (
                                    <article
                                        key={spot.id}
                                        className="overflow-hidden rounded-2xl border border-[#e3ddcf] bg-white shadow-[0_12px_35px_rgba(23,60,52,0.05)]"
                                    >
                                        <img
                                            src={spot.image_url || '/island-paradise-3.jpg'}
                                            alt={spot.name}
                                            className="h-52 w-full object-cover"
                                        />
                                        <div className="p-5">
                                            <p className="text-[10px] font-bold tracking-[0.14em] text-[#bd8b3d] uppercase">
                                                {spot.category || 'Tourist Spot'}
                                            </p>
                                            <h3 className="mt-2 font-serif text-2xl text-[#173c34]">
                                                {spot.name}
                                            </h3>
                                            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#173c34]/70">
                                                {spot.location || 'Abuyog, Leyte'}
                                            </p>
                                            <p className="mt-3 text-sm leading-6 text-[#718078]">
                                                {spot.description || 'Information coming soon.'}
                                            </p>
                                            <Link href="/discover" className="mt-5 inline-flex text-xs font-bold tracking-[0.12em] text-[#9b6a28]">
                                                VIEW DETAILS →
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}
