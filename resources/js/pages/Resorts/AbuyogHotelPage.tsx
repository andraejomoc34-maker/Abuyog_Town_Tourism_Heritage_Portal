import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BedDouble, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

type HotelRoom = {
    id: number;
    name: string;
    room_type: string;
    description?: string | null;
    capacity?: number | null;
    price?: number | string | null;
    available_quantity: number;
    status: string;
    image?: string | null;
};

type Hotel = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    contact_information?: string | null;
    amenities?: string[] | null;
    price_information?: string | null;
    hotel_rooms?: HotelRoom[];
};

const galleryImages = [
    { src: '/Abuyog-hotel-1.jpg', alt: 'Exterior view of Abuyog Hotel' },
    { src: '/Abuyog-hotel-2.jpg', alt: 'Abuyog Hotel grounds and exterior' },
    { src: '/Abuyog-hotel-room.jpg', alt: 'Guest room at Abuyog Hotel' },
    { src: '/Abuyog-hotel-room-1.jpg', alt: 'Guest room interior at Abuyog Hotel' },
];

const roomFallbackImages = [
    '/Abuyog-hotel-room.jpg',
    '/Abuyog-hotel-room-1.jpg',
    '/Abuyog-hotel-1.jpg',
    '/Abuyog-hotel-2.jpg',
];

const roomImageOverrides: Record<string, { src: string; alt: string }> = {
    'Executive Room': {
        src: '/Abuyog-hotel-6.jpg',
        alt: 'Abuyog Hotel Executive Room',
    },
    'Executive Suite Room': {
        src: '/Abuyog-hotel-7.jpg',
        alt: 'Abuyog Hotel Executive Suite Room',
    },
};

const navigation = [
    { label: 'Home', href: '#home' },
    { label: 'Our Rooms', href: '#rooms' },
    { label: 'About', href: '#about' },
    { label: 'Amenities', href: '#amenities' },
    { label: 'Contact', href: '#contact' },
];

function formatPrice(price: number | string | null | undefined): string | null {
    if (price === null || price === undefined || price === '') {
        return null;
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
        return null;
    }

    return `₱${numericPrice.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`;
}

export default function AbuyogHotelPage({
    resort,
    canBook,
    canInquire,
}: {
    resort: Hotel;
    canBook: boolean;
    canInquire: boolean;
}) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const bookingHref = `/resorts/${resort.id}/book`;
    const inquiryHref = `/resorts/${resort.id}/inquire`;
    const rooms = resort.hotel_rooms ?? [];
    const amenities = resort.amenities ?? [];

    return (
        <>
            <Head title="ABUYOG HOTEL | Abuyog, Leyte" />
            <div className="scroll-smooth bg-[#f8f3e8] text-[#173c34]">
                <header className="sticky top-0 z-40 border-b border-[#173c34]/10 bg-[#f8f3e8]">
                    <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
                        <a
                            href="#home"
                            className="shrink-0 text-[17px] font-semibold tracking-[0.08em] text-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d99d4b]"
                        >
                            ABUYOG HOTEL
                        </a>

                        <nav
                            aria-label="Hotel navigation"
                            className="hidden items-center gap-6 lg:flex xl:gap-9"
                        >
                            {navigation.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm text-[#273b35] transition-colors hover:text-[#a96d22] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d99d4b]"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <Link
                                href={bookingHref}
                                className="inline-flex min-h-11 items-center justify-center bg-[#d99d4b] px-6 text-sm font-semibold text-[#173c34] transition-colors hover:bg-[#edbd73] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173c34]"
                            >
                                Booking
                            </Link>
                            <Link
                                href={auth.user ? '/dashboard' : '/login'}
                                className="text-sm text-[#273b35] underline-offset-4 transition-colors hover:text-[#a96d22] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d99d4b]"
                            >
                                {auth.user ? 'My account' : 'Login'}
                            </Link>
                        </nav>

                        <button
                            type="button"
                            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="abuyog-hotel-mobile-navigation"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    setMobileMenuOpen(false);
                                }
                            }}
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-[#173c34]/25 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99d4b]"
                        >
                            {mobileMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
                        </button>
                    </div>

                    {mobileMenuOpen && (
                        <nav
                            id="abuyog-hotel-mobile-navigation"
                            aria-label="Mobile hotel navigation"
                            className="border-t border-[#173c34]/10 bg-[#f8f3e8] px-5 py-3 lg:hidden"
                        >
                            <div className="mx-auto flex max-w-[1440px] flex-col">
                                {navigation.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex min-h-12 items-center border-b border-[#173c34]/10 text-sm focus-visible:outline-2 focus-visible:outline-[#d99d4b]"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <Link
                                    href={bookingHref}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-3 flex min-h-12 items-center justify-center bg-[#d99d4b] px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173c34]"
                                >
                                    Booking
                                </Link>
                                <Link
                                    href={auth.user ? '/dashboard' : '/login'}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex min-h-12 items-center text-sm focus-visible:outline-2 focus-visible:outline-[#d99d4b]"
                                >
                                    {auth.user ? 'My account' : 'Login'}
                                </Link>
                            </div>
                        </nav>
                    )}
                </header>

                <main>
                    <section
                        id="home"
                        className="relative isolate flex min-h-[660px] items-center justify-center overflow-hidden bg-[#173c34] text-center text-white sm:min-h-[720px] lg:min-h-[calc(100svh-76px)]"
                    >
                        <img
                            src="/Abuyog-hotel.jpg"
                            alt="Abuyog Hotel exterior in Abuyog, Leyte"
                            fetchPriority="high"
                            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 -z-10 bg-[#102722]/50" />
                        <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8">
                            <p className="text-xs font-semibold tracking-[0.24em] text-[#edbd73] sm:text-sm">
                                ABUYOG, LEYTE · PHILIPPINES
                            </p>
                            <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold text-white sm:text-6xl lg:text-7xl">
                                Your comfortable stay in Abuyog
                            </h1>
                            <p className="mx-auto mt-6 max-w-xl text-base text-white/90 sm:text-lg">
                                {resort.location || 'Abuyog, Leyte, Philippines'}
                            </p>
                            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                                <Link
                                    href={canBook ? bookingHref : '#rooms'}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#d99d4b] px-8 text-sm font-semibold text-[#173c34] transition-colors hover:bg-[#edbd73] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                >
                                    {canBook ? 'Book now' : 'Explore rooms'}
                                    <ArrowUpRight aria-hidden="true" size={16} />
                                </Link>
                                <a
                                    href="#contact"
                                    className="inline-flex min-h-12 items-center justify-center border border-white/80 px-8 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                                >
                                    Contact us
                                </a>
                            </div>
                        </div>
                        <a
                            href="#highlights"
                            aria-label="Scroll to hotel highlights"
                            className="absolute bottom-7 left-1/2 hidden h-10 w-px -translate-x-1/2 bg-white/70 sm:block"
                        />
                    </section>

                    <section id="highlights" className="border-b border-[#173c34]/10 bg-white">
                        <div className="mx-auto grid max-w-[1280px] divide-y divide-[#173c34]/10 px-5 py-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12">
                            <article className="py-7 sm:px-7 sm:py-9 lg:px-10">
                                <BedDouble aria-hidden="true" className="text-[#b77c30]" size={22} strokeWidth={1.5} />
                                <h2 className="mt-4 text-base font-semibold">Room choices</h2>
                                <p className="mt-2 text-sm leading-6 text-[#53645d]">
                                    Explore {rooms.length || 'available'} room {rooms.length === 1 ? 'type' : 'types'} for your stay.
                                </p>
                            </article>
                            <article className="py-7 sm:px-7 sm:py-9 lg:px-10">
                                <MapPin aria-hidden="true" className="text-[#b77c30]" size={22} strokeWidth={1.5} />
                                <h2 className="mt-4 text-base font-semibold">In Abuyog, Leyte</h2>
                                <p className="mt-2 text-sm leading-6 text-[#53645d]">
                                    A hotel stay in Abuyog, Philippines.
                                </p>
                            </article>
                            <article className="py-7 sm:px-7 sm:py-9 lg:px-10">
                                <ArrowUpRight aria-hidden="true" className="text-[#b77c30]" size={22} strokeWidth={1.5} />
                                <h2 className="mt-4 text-base font-semibold">Online booking</h2>
                                <p className="mt-2 text-sm leading-6 text-[#53645d]">
                                    Check current room availability through the booking system.
                                </p>
                            </article>
                        </div>
                    </section>

                    <section id="rooms" className="scroll-mt-24 bg-[#f8f3e8] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
                        <div className="mx-auto max-w-[1280px]">
                            <div className="flex flex-col justify-between gap-5 border-b border-[#173c34]/20 pb-8 sm:flex-row sm:items-end">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] text-[#a96d22]">REST AND RECHARGE</p>
                                    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Our rooms</h2>
                                </div>
                                <p className="max-w-md text-sm leading-6 text-[#53645d]">
                                    View room details and the rates currently listed for Abuyog Hotel.
                                </p>
                            </div>

                            <div className="mt-8 grid gap-x-7 gap-y-10 md:grid-cols-2 lg:gap-x-10 lg:gap-y-14">
                                {rooms.map((room, index) => {
                                    const isAvailable = room.status === 'Available' && room.available_quantity > 0;
                                    const roomPrice = formatPrice(room.price);
                                    const roomImageOverride = roomImageOverrides[room.name];
                                    const roomImage = roomImageOverride?.src || room.image || roomFallbackImages[index % roomFallbackImages.length];

                                    return (
                                        <article key={room.id} className="min-w-0">
                                            <a href="#gallery" className="group block overflow-hidden bg-[#e7dfcf] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d99d4b]">
                                                <img
                                                    src={roomImage}
                                                    alt={roomImageOverride?.alt ?? `${room.name} at Abuyog Hotel`}
                                                    loading="lazy"
                                                    className="aspect-[1.55/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                                                />
                                            </a>
                                            <div className="flex flex-col gap-4 border-b border-[#173c34]/20 py-5 sm:flex-row sm:items-end sm:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className="text-xl font-semibold">{room.name}</h3>
                                                    {room.description && (
                                                        <p className="mt-2 text-sm leading-6 text-[#53645d]">{room.description}</p>
                                                    )}
                                                    {room.capacity !== null && room.capacity !== undefined && (
                                                        <p className="mt-2 text-sm text-[#53645d]">Capacity: {room.capacity}</p>
                                                    )}
                                                    {roomPrice ? (
                                                        <p className="mt-3 text-lg font-semibold text-[#173c34]">{roomPrice}</p>
                                                    ) : (
                                                        <p className="mt-3 text-sm text-[#53645d]">Rate not listed</p>
                                                    )}
                                                    <p className="mt-1 text-xs text-[#68766f]">
                                                        {isAvailable ? `${room.available_quantity} available` : 'Currently unavailable'}
                                                    </p>
                                                </div>
                                                {isAvailable ? (
                                                    <Link
                                                        href={bookingHref}
                                                        className="inline-flex min-h-11 shrink-0 items-center justify-center bg-[#173c34] px-6 text-sm font-semibold text-white transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99d4b]"
                                                    >
                                                        Book now
                                                    </Link>
                                                ) : (
                                                    <a
                                                        href="#contact"
                                                        className="inline-flex min-h-11 shrink-0 items-center justify-center border border-[#173c34]/35 px-6 text-sm font-semibold text-[#173c34] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d99d4b]"
                                                    >
                                                        Ask about this room
                                                    </a>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>

                            {rooms.length === 0 && (
                                <p className="py-12 text-sm text-[#53645d]">Room details are not currently available.</p>
                            )}

                            {resort.price_information && (
                                <p className="mt-7 max-w-4xl text-xs leading-6 text-[#68766f]">
                                    {resort.price_information}
                                </p>
                            )}
                        </div>
                    </section>

                    <section id="about" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
                        <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-[#a96d22]">A PLACE TO STAY</p>
                                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">About Abuyog Hotel</h2>
                            </div>
                            <div className="max-w-2xl">
                                <p className="text-base leading-8 text-[#53645d]">
                                    {resort.description || 'Comfortable hotel accommodation in Abuyog, Leyte.'}
                                </p>
                                <p className="mt-5 flex items-center gap-2 text-sm text-[#173c34]">
                                    <MapPin aria-hidden="true" size={17} className="text-[#b77c30]" />
                                    {resort.location || 'Abuyog, Leyte, Philippines'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="amenities" className="scroll-mt-24 border-y border-[#173c34]/10 bg-[#f1eadb] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
                        <div className="mx-auto grid max-w-[1280px] gap-6 sm:grid-cols-[0.7fr_1.3fr] sm:items-center">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-[#a96d22]">YOUR STAY</p>
                                <h2 className="mt-3 text-3xl font-semibold">Amenities</h2>
                            </div>
                            {amenities.length > 0 ? (
                                <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                                    {amenities.map((amenity) => (
                                        <li key={amenity} className="border-b border-[#173c34]/20 py-3 text-sm text-[#344b43]">
                                            {amenity}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="max-w-xl text-sm leading-7 text-[#53645d]">
                                    Amenity details have not been listed. Please send an inquiry for current information.
                                </p>
                            )}
                        </div>
                    </section>

                    <section id="gallery" className="scroll-mt-24 bg-[#f8f3e8] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
                        <div className="mx-auto max-w-[1280px]">
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#a96d22]">A CLOSER LOOK</p>
                            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Hotel gallery</h2>
                            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                                {galleryImages.map((image, index) => (
                                    <figure key={image.src} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            loading="lazy"
                                            className={`w-full object-cover ${index === 0 ? 'h-full min-h-[260px] max-h-[620px]' : 'aspect-[1.35/1]'}`}
                                        />
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-[#173c34] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
                        <div className="mx-auto flex max-w-[1280px] flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-[#edbd73]">PLAN YOUR STAY</p>
                                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Ready to stay in Abuyog?</h2>
                                <p className="mt-3 text-sm text-white/80">Explore room availability at Abuyog Hotel.</p>
                            </div>
                            <Link
                                href={canBook ? bookingHref : '#rooms'}
                                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-[#d99d4b] px-8 text-sm font-semibold text-[#173c34] transition-colors hover:bg-[#edbd73] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                {canBook ? 'Book now' : 'View rooms'}
                                <ArrowUpRight aria-hidden="true" size={16} />
                            </Link>
                        </div>
                    </section>

                    <footer id="contact" className="scroll-mt-24 bg-[#102f29] px-5 py-12 text-white sm:px-8 lg:px-12">
                        <div className="mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
                            <div>
                                <a href="#home" className="text-lg font-semibold tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#edbd73]">
                                    ABUYOG HOTEL
                                </a>
                                <p className="mt-3 flex items-center gap-2 text-sm text-white/75">
                                    <MapPin aria-hidden="true" size={16} />
                                    {resort.location || 'Abuyog, Leyte, Philippines'}
                                </p>
                                {resort.contact_information ? (
                                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/75">{resort.contact_information}</p>
                                ) : (
                                    <p className="mt-3 text-sm leading-6 text-white/75">Contact details are not currently listed.</p>
                                )}
                                {canInquire && (
                                    <Link
                                        href={inquiryHref}
                                        className="mt-5 inline-flex min-h-11 items-center border border-white/50 px-5 text-sm transition-colors hover:bg-white hover:text-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73]"
                                    >
                                        Send an inquiry
                                    </Link>
                                )}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">Explore</h2>
                                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm text-white/75">
                                    {navigation.map((item) => (
                                        <a key={item.href} href={item.href} className="transition-colors hover:text-[#edbd73] focus-visible:outline-2 focus-visible:outline-[#edbd73]">
                                            {item.label}
                                        </a>
                                    ))}
                                    <Link href={bookingHref} className="transition-colors hover:text-[#edbd73] focus-visible:outline-2 focus-visible:outline-[#edbd73]">
                                        Booking
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">Abuyog Tourism</h2>
                                <p className="mt-4 max-w-xs text-sm leading-6 text-white/75">
                                    Discover more places and experiences around Abuyog.
                                </p>
                                <Link href="/" className="mt-3 inline-flex items-center gap-2 text-sm text-[#edbd73] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73]">
                                    Visit the tourism portal <ArrowUpRight aria-hidden="true" size={15} />
                                </Link>
                            </div>
                        </div>
                        <div className="mx-auto mt-10 max-w-[1280px] border-t border-white/15 pt-5 text-xs text-white/55">
                            ABUYOG HOTEL · ABUYOG, LEYTE, PHILIPPINES
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}