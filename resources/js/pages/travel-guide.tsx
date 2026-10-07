import { Head, Link } from '@inertiajs/react';
import {
    BusFront,
    Car,
    CloudSun,
    Compass,
    Hotel,
    MapPinned,
    Route,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import PublicMobileMenu from '../components/PublicMobileMenu';

const arrivalOptions = [
    {
        title: 'Bus',
        detail: 'Available from major routes heading toward Leyte and nearby destinations.',
        icon: BusFront,
    },
    {
        title: 'Private Car',
        detail: 'A convenient option for travelers who want flexible stops along the way.',
        icon: Car,
    },
    {
        title: 'Taxi',
        detail: 'Useful for direct transfers from regional gateways and town centers.',
        icon: Route,
    },
    {
        title: 'Ride-hailing',
        detail: 'Where available, rideshare services can help complete the final leg.',
        icon: MapPinned,
    },
];

const busRoutes = [
    {
        departure: 'Tacloban / Leyte urban routes',
        destination: 'Abuyog, Leyte',
        type: 'Bus / Public transport',
        notes: 'Travel times and service frequency vary depending on operating schedules.',
    },
    {
        departure: 'Nearby municipalities and provincial hubs',
        destination: 'Abuyog, Leyte',
        type: 'Bus / Van / Shared transport',
        notes: 'Check current schedules before departure for the most convenient route.',
    },
    {
        departure: 'Regional travel points',
        destination: 'Abuyog, Leyte',
        type: 'Public transport',
        notes: 'Schedules and availability may change with weather and seasonal demand.',
    },
];

const localTransport = [
    'Tricycle',
    'Jeepney',
    'Bus',
    'Van',
];

const travelTips = [
    'Check weather conditions before travelling.',
    'Confirm transport schedules before departure.',
    'Keep important contact information with you.',
    'Bring enough cash for local transportation where needed.',
    'Allow extra travel time for traffic and weather.',
];

export default function TravelGuide() {
    return (
        <>
            <Head title="How to Get to Abuyog" />
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

                <main className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
                    <div className="text-center">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                            MAKE YOUR WAY HERE
                        </p>
                        <h1 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-5xl lg:text-6xl">
                            HOW TO GET TO ABUYOG
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#718078]">
                            Plan your journey to Abuyog, Leyte.
                        </p>
                    </div>

                    <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_12px_35px_rgba(23,60,52,0.05)]">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34]">
                                    <PlaneArrivalIcon />
                                </span>
                                <h2 className="font-serif text-3xl text-[#173c34]">
                                    From Tacloban Airport
                                </h2>
                            </div>
                            <p className="text-sm leading-7 text-[#718078]">
                                Visitors arriving through Tacloban Airport can continue by road toward Abuyog, Leyte. Travel options from the airport typically include bus services, private vehicles, taxis, and ride-hailing services where available.
                            </p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {arrivalOptions.map((option) => {
                                    const Icon = option.icon;

                                    return (
                                        <div
                                            key={option.title}
                                            className="rounded-2xl border border-[#e7ddca] bg-[#fbf8f0] p-4"
                                        >
                                            <Icon className="h-5 w-5 text-[#9b6a28]" />
                                            <h3 className="mt-3 font-semibold text-[#173c34]">
                                                {option.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[#718078]">
                                                {option.detail}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="mt-6 rounded-2xl border border-[#e3ddcf] bg-[#f8f3e8] p-4 text-sm leading-6 text-[#173c34]">
                                Check with the transport provider for the latest schedule, fare, and availability.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_12px_35px_rgba(23,60,52,0.05)]">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34]">
                                    <BusFront className="h-5 w-5" />
                                </span>
                                <h2 className="font-serif text-3xl text-[#173c34]">
                                    By Bus
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {busRoutes.map((route) => (
                                    <div
                                        key={route.departure}
                                        className="rounded-2xl border border-[#e7ddca] bg-[#fbf8f0] p-4"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-xs font-bold tracking-[0.12em] text-[#bd8b3d] uppercase">
                                                Departure
                                            </span>
                                            <span className="text-sm text-[#173c34]">{route.departure}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-4">
                                            <span className="text-xs font-bold tracking-[0.12em] text-[#bd8b3d] uppercase">
                                                Destination
                                            </span>
                                            <span className="text-sm text-[#173c34]">{route.destination}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-4">
                                            <span className="text-xs font-bold tracking-[0.12em] text-[#bd8b3d] uppercase">
                                                Transport type
                                            </span>
                                            <span className="text-sm text-[#173c34]">{route.type}</span>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-[#718078]">
                                            {route.notes}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_12px_35px_rgba(23,60,52,0.05)]">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34]">
                                    <Car className="h-5 w-5" />
                                </span>
                                <h2 className="font-serif text-3xl text-[#173c34]">
                                    By Private Vehicle
                                </h2>
                            </div>
                            <p className="text-sm leading-7 text-[#718078]">
                                If you are traveling with your own vehicle, you can drive directly to Abuyog, Leyte and stop at destinations along the route with more flexibility.
                            </p>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Abuyog+Leyte+Philippines"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-6 inline-flex rounded-none bg-[#173c34] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-[#1f4b43]"
                            >
                                Get Directions
                            </a>
                        </div>

                        <div className="rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_12px_35px_rgba(23,60,52,0.05)]">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34]">
                                    <Hotel className="h-5 w-5" />
                                </span>
                                <h2 className="font-serif text-3xl text-[#173c34]">
                                    Local Transportation
                                </h2>
                            </div>
                            <ul className="space-y-3">
                                {localTransport.map((transport) => (
                                    <li key={transport} className="flex items-center gap-3 rounded-xl bg-[#fbf8f0] px-4 py-3 text-sm text-[#173c34]">
                                        <ShieldCheck className="h-4 w-4 text-[#9b6a28]" />
                                        {transport}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-5 text-sm leading-6 text-[#718078]">
                                Fares and availability may change. Confirm locally.
                            </p>
                        </div>
                    </section>

                    <section className="mt-8 rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_12px_35px_rgba(23,60,52,0.05)]">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34]">
                                <Compass className="h-5 w-5" />
                            </span>
                            <h2 className="font-serif text-3xl text-[#173c34]">
                                Travel Tips
                            </h2>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {travelTips.map((tip) => (
                                <div key={tip} className="rounded-2xl border border-[#e7ddca] bg-[#fbf8f0] p-4 text-sm leading-6 text-[#718078]">
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link href="/map" className="rounded-none border border-[#173c34] px-5 py-3 text-sm font-semibold text-[#173c34] transition hover:bg-[#173c34] hover:text-white">
                            Explore the Map
                        </Link>
                        <Link href="/resorts" className="rounded-none bg-[#123d36] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-[#1c4d45]">
                            View Resorts
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}

function PlaneArrivalIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 16l20-8-8 20-2-8-10-4Z" />
            <path d="m14 10 8-4" />
        </svg>
    );
}
