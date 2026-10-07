import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type Resort = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    image?: string | null;
    image_url?: string | null;
    status?: string | null;
    property_type?: string | null;
    property_code?: string | null;
    can_book?: boolean;
    users?: { id: number; name: string }[];
};

export default function ResortsIndex({ resorts }: { resorts: Resort[] }) {
    return (
        <>
            <Head title="Resorts" />
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
                            className="hidden rounded-none bg-black px-4 py-2 text-xs font-semibold text-[#173c34] sm:inline-flex"
                        >
                            Back to Home
                        </Link>
                        <PublicMobileMenu />
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
                    <div className="mb-10 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                STAY OPTIONS
                            </p>
                            <h1 className="mt-3 font-serif text-4xl text-[#173c34] sm:text-5xl">
                                Resorts &amp; accommodations
                            </h1>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {resorts.map((resort) => (
                            <article key={resort.id} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(31,54,44,.08)]">
                                <img
                                    src={
                                        resort.image_url || resort.image || '/abuyog-2.jpg'
                                    }
                                    alt={resort.name}
                                    className="h-60 w-full object-cover"
                                />
                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-bold tracking-[0.14em] text-[#bd8b3d] uppercase">
                                                {resort.name === 'Malaguicay Falls'
                                                    ? 'ACTIVE'
                                                    : resort.property_type === 'hotel'
                                                      ? 'ACTIVE'
                                                    : resort.status || 'active'}
                                            </p>
                                            <p className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-[#173c34] uppercase">
                                                {resort.property_type === 'hotel'
                                                    ? 'HOTEL'
                                                    : resort.property_type === 'condotel'
                                                      ? 'CONDOTEL'
                                                    : resort.property_type === 'nature'
                                                      ? 'NATURE DESTINATION'
                                                                                                        : resort.property_type === 'budget_accommodation'
                                                                                                            ? 'BUDGET ACCOMMODATION'
                                                                                                        : resort.property_type === 'lodge'
                                                                                                            ? 'LODGE / ACCOMMODATION'
                                                                                                        : resort.property_type === 'inn'
                                                                                                            ? 'INN / ACCOMMODATION'
                                                      : 'RESORT'}
                                            </p>
                                        </div>
                                        {resort.name === 'Malaguicay Falls' && resort.users?.[0] && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#edbd73] bg-[#f8f3e8] px-2.5 py-1 text-[10px] font-semibold text-[#173c34]">
                                                <ShieldCheck
                                                    aria-hidden="true"
                                                    className="h-3.5 w-3.5 text-[#d99d4b]"
                                                />
                                                <span>Admin Resort</span>
                                                <span className="text-[#718078]">
                                                    {resort.users[0].name}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="mt-2 font-serif text-2xl text-[#173c34]">
                                        {resort.name}
                                    </h2>
                                    <p className="mt-2 text-sm text-[#718078]">
                                        {resort.location || 'Abuyog, Leyte'}
                                    </p>
                                    {resort.property_code !== 'ellen-fuentes-travellers-inn' && (
                                        <p className="mt-4 text-sm leading-6 text-[#718078]">
                                            {resort.description ||
                                                'Sample resort listing for the tourism portal.'}
                                        </p>
                                    )}
                                    <div className="mt-5 flex gap-3">
                                        <Link
                                            href={`/resorts/${resort.id}`}
                                            className="rounded-none bg-[#173c34] bg-black px-4 py-2 text-xs font-semibold text-white"
                                        >
                                            View Details
                                        </Link>
                                        {resort.can_book ? (
                                            <Link
                                                href={`/resorts/${resort.id}/book`}
                                                className="rounded-none border border-black px-4 py-2 text-xs font-semibold text-white"
                                            >
                                                Book Now
                                            </Link>
                                        ) : null}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
