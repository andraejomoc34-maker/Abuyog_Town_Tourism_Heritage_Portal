import { Head, Link } from '@inertiajs/react';
import { View } from 'lucide-react';
import PublicMobileMenu from '../../components/PublicMobileMenu';
import AbuyogHotelPage from './AbuyogHotelPage';

type Resort = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    image?: string | null;
    image_url?: string | null;
    contact_information?: string | null;
    amenities?: string[] | null;
    price_information?: string | null;
    status?: string | null;
    property_type?: string | null;
    property_code?: string | null;
    hotel_rooms?: HotelRoom[];
};

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

export default function ResortShow({
    resort,
    canBook,
    canInquire,
}: {
    resort: Resort;
    canBook?: boolean;
    canInquire?: boolean;
}) {
    const isHotel = resort.property_type === 'hotel';
    const amenities = resort.amenities ?? [];
    const isActive = String(resort.status ?? 'active').toLowerCase() === 'active';
    const isVillageCondotel = resort.property_code === 'village-condotel';
    const isHabitatBudgetInn = resort.property_code === 'habitat-budget-inn';
    const isFlorinaCountryLodge = resort.property_code === 'florina-country-lodge';
    const isEllenFuentesTravellersInn = resort.property_code === 'ellen-fuentes-travellers-inn';
    const canBookNow = canBook === true;
    const canSubmitInquiry = !isHabitatBudgetInn && !isFlorinaCountryLodge && !isEllenFuentesTravellersInn && (canInquire ?? isActive);

    if (resort.property_code === 'abuyog-hotel') {
        return (
            <AbuyogHotelPage
                resort={resort}
                canBook={canBookNow}
                canInquire={canSubmitInquiry}
            />
        );
    }

    return (
        <>
            <Head title={resort.name} />
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
                            href="/resorts"
                            className="hidden rounded-none bg-white px-4 py-2 text-xs font-semibold text-[#173c34] sm:inline-flex"
                        >
                            Back to Resorts
                        </Link>
                        <PublicMobileMenu />
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
                    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(23,60,52,.08)]">
                        <img
                            src={resort.image_url || resort.image || '/abuyog-2.jpg'}
                            alt={isEllenFuentesTravellersInn ? "Ellen Fuentes Traveller's Inn exterior" : isFlorinaCountryLodge ? 'Florina Country Lodge exterior' : isHabitatBudgetInn ? 'Habitat Budget Inn entrance corridor' : isVillageCondotel ? 'The Village Condotel exterior' : resort.name}
                            className="h-[360px] w-full object-cover md:h-[500px]"
                        />
                        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.5fr_0.9fr]">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d] uppercase">
                                    {isHotel
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
                                <h1 className="mt-3 font-serif text-4xl text-[#173c34] sm:text-5xl">
                                    {resort.name}
                                </h1>
                                {!isEllenFuentesTravellersInn && (
                                    <p className="mt-4 text-sm leading-7 text-[#718078]">
                                        {resort.description ||
                                            'Description not available.'}
                                    </p>
                                )}

                                {isVillageCondotel && (
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Image gallery
                                        </h2>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <img
                                                src="/The village-1.jpg"
                                                alt="The Village Condotel furnished living area"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                            <img
                                                src="/The village-2.jpg"
                                                alt="The Village Condotel dining area"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                        </div>
                                    </section>
                                )}

                                {isHabitatBudgetInn && (
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Image gallery
                                        </h2>
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <img
                                                src="/Habitat-1.jpg"
                                                alt="Habitat Budget Inn interior stairway and balcony"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                            <img
                                                src="/Habitat-room.jpg"
                                                alt="Habitat Budget Inn room with two beds"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                            <img
                                                src="/Habitat-room-1.jpg"
                                                alt="Habitat Budget Inn hallway"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                        </div>
                                    </section>
                                )}

                                {isFlorinaCountryLodge && (
                                    <>
                                        <section className="mt-8">
                                            <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                                Image gallery
                                            </h2>
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <img
                                                    src="/Florida-room.jpg"
                                                    alt="Florina Country Lodge room with a bed"
                                                    className="h-36 w-full rounded-xl object-cover sm:h-48"
                                                />
                                            </div>
                                        </section>
                                        <section className="mt-8">
                                            <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                                Room rates and information
                                            </h2>
                                            <p className="mt-2 text-xs leading-5 text-[#718078]">
                                                Rates shown from the provided accommodation information.
                                            </p>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Family Room</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">Good for 2 persons</p>
                                                    <p className="mt-2 text-sm text-[#53645d]">Air-conditioned · Hot &amp; cold shower · Cable TV</p>
                                                    <p className="mt-3 text-sm text-[#173c34]">2:00 PM check-in — ₱1,800</p>
                                                    <p className="mt-1 text-sm text-[#173c34]">12:00 noon check-out with free breakfast — ₱2,000</p>
                                                </section>
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">De Luxe Rooms</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">Good for 2 persons</p>
                                                    <p className="mt-2 text-sm text-[#53645d]">Air-conditioned · Hot &amp; cold shower · Cable TV</p>
                                                    <p className="mt-3 text-sm text-[#173c34]">2:00 PM check-in — ₱1,500</p>
                                                    <p className="mt-1 text-sm text-[#173c34]">12:00 noon check-out with free breakfast — ₱1,700</p>
                                                </section>
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Basic Room</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">Good for 2 persons</p>
                                                    <p className="mt-2 text-sm text-[#53645d]">Air-conditioned room · Cable TV</p>
                                                    <p className="mt-3 text-sm text-[#173c34]">2:00 PM check-in — ₱1,100</p>
                                                    <p className="mt-1 text-sm text-[#173c34]">12:00 noon check-out with free breakfast — ₱1,300</p>
                                                </section>
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Budget Rooms</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">Good for 2 persons</p>
                                                    <p className="mt-2 text-sm text-[#53645d]">Electric fan</p>
                                                    <p className="mt-3 text-sm text-[#173c34]">12 hours — ₱350</p>
                                                    <p className="mt-1 text-sm text-[#173c34]">24 hours — ₱450</p>
                                                </section>
                                            </div>
                                            <div className="mt-4 border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Additional Fees</h3>
                                                <ul className="mt-2 grid gap-1 text-sm text-[#53645d] sm:grid-cols-2">
                                                    <li>Extra Person — ₱100 per head</li>
                                                    <li>Extra Bed/Person — ₱100 / ₱200</li>
                                                    <li>Early Check-In — ₱100/hour</li>
                                                    <li>Late Check-Out — ₱100/hour</li>
                                                </ul>
                                            </div>
                                        </section>
                                    </>
                                )}

                                {isEllenFuentesTravellersInn && (
                                    <>
                                        <section className="mt-8">
                                            <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                                Room Rates
                                            </h2>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Air-Conditioned Rooms</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">with cable television</p>
                                                    <p className="mt-1 text-sm text-[#53645d]">Good for 2 pax</p>
                                                    <ul className="mt-3 space-y-1 text-sm text-[#173c34]">
                                                        <li>24 hours — ₱1,200</li>
                                                        <li>12 hours — ₱900</li>
                                                        <li>6 hours — ₱700</li>
                                                    </ul>
                                                </section>
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Ordinary Rooms</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">with cable television</p>
                                                    <p className="mt-1 text-sm text-[#53645d]">Good for 2 pax</p>
                                                    <ul className="mt-3 space-y-1 text-sm text-[#173c34]">
                                                        <li>24 hours — ₱900</li>
                                                        <li>12 hours — ₱700</li>
                                                        <li>6 hours — ₱500</li>
                                                    </ul>
                                                </section>
                                                <section className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                    <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Special Room Available</h3>
                                                    <p className="mt-2 text-sm text-[#53645d]">Room No. 189</p>
                                                    <p className="mt-1 text-sm text-[#53645d]">24 hours only</p>
                                                    <ul className="mt-3 space-y-1 text-sm text-[#173c34]">
                                                        <li>Room 1 — ₱1,400</li>
                                                        <li>Room 2 — ₱1,400</li>
                                                    </ul>
                                                </section>
                                            </div>
                                            <section className="mt-4 border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">Additional Fees</h3>
                                                <ul className="mt-2 grid gap-1 text-sm text-[#53645d] sm:grid-cols-2">
                                                    <li>Extension: ₱150 per hour</li>
                                                    <li>Extra Bed: ₱250</li>
                                                    <li>Senior Citizen Discount: 20%</li>
                                                    <li>Please provide ID for verification.</li>
                                                </ul>
                                            </section>
                                        </section>
                                    </>
                                )}

                                {isEllenFuentesTravellersInn && (
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Image Gallery
                                        </h2>
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            <img
                                                src="/Fuentes-room.jpg"
                                                alt="Ellen Fuentes Traveller's Inn guest room with a bed"
                                                className="h-36 w-full rounded-xl object-cover sm:h-48"
                                            />
                                        </div>
                                    </section>
                                )}

                                {isHabitatBudgetInn && (
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Pricing
                                        </h2>
                                        <p className="mt-2 text-xs leading-5 text-[#718078]">
                                             This is dependently verified as current official rates.
                                        </p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">
                                                    Lodging
                                                </h3>
                                                <p className="mt-2 text-lg font-semibold text-[#173c34]">
                                                    ₱300 / day
                                                </p>
                                            </div>
                                            <div className="border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                <h3 className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">
                                                    Boarding
                                                </h3>
                                                <p className="mt-2 text-lg font-semibold text-[#173c34]">
                                                    ₱2,500 / person
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {isVillageCondotel && resort.price_information && (
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Room, unit, and rate information
                                        </h2>
                                        <p className="mt-3 break-words text-sm leading-7 whitespace-pre-line text-[#53645d]">
                                            {resort.price_information}
                                        </p>
                                    </section>
                                )}

                                {isHotel && (
                                    <>
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Hotel gallery
                                        </h2>
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                            {[
                                                '/Abuyog-hotel-1.jpg',
                                                '/Abuyog-hotel-2.jpg',
                                                '/Abuyog-hotel-room.jpg',
                                                '/Abuyog-hotel-room-1.jpg',
                                            ].map((image) => (
                                                <img
                                                    key={image}
                                                    src={image}
                                                    alt="Abuyog Hotel"
                                                    className="h-28 w-full rounded-xl object-cover sm:h-32"
                                                />
                                            ))}
                                        </div>
                                    </section>
                                    <section className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Available rooms
                                        </h2>
                                        <p className="mt-2 text-xs text-[#718078]">
                                             This is verified as current official rates.
                                        </p>
                                        <div className="mt-4 space-y-3">
                                            {(resort.hotel_rooms ?? []).map((room) => {
                                                const isAvailable = room.status === 'Available' && room.available_quantity > 0;

                                                return (
                                                    <article key={room.id} className="rounded-xl border border-[#e7e3d7] bg-[#fffdf8] p-4">
                                                        <div className="flex flex-col gap-3 sm:flex-row">
                                                            {room.image && (
                                                                <img src={room.image} alt={room.name} className="h-24 w-full rounded-lg object-cover sm:w-32" />
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="font-semibold text-[#173c34]">{room.name}</h3>
                                                                <p className="mt-1 text-sm text-[#53645d]">
                                                                    Capacity: {room.capacity ?? 'Not listed'}
                                                                </p>
                                                                <p className="mt-1 text-sm text-[#53645d]">
                                                                    {room.price != null
                                                                        ? `Listed price: ₱${Number(room.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                                                        : 'Rate not listed'}
                                                                </p>
                                                                <p className="mt-1 text-sm text-[#53645d]">
                                                                    Availability: {isAvailable ? `${room.available_quantity} available` : 'Unavailable'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </section>
                                    </>
                                )}

                                {amenities.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Amenities
                                        </h2>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {amenities.map((feature) => (
                                                <span
                                                    key={feature}
                                                    className="rounded-full bg-[#f7ead1] px-3 py-2 text-xs font-medium text-[#173c34]"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <aside className="rounded-2xl border border-[#e7e3d7] bg-[#f8f5ef] p-6">
                                <h2 className="text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                    Location
                                </h2>
                                <p className="mt-3 text-sm text-[#53645d]">
                                    {resort.location || 'Abuyog, Leyte'}
                                </p>

                                {isEllenFuentesTravellersInn ? (
                                    <>
                                        <h2 className="mt-8 text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Contact and Location Details
                                        </h2>
                                        <p className="mt-3 text-sm leading-6 whitespace-pre-line text-[#53645d]">
                                            {resort.contact_information}
                                        </p>
                                    </>
                                ) : isFlorinaCountryLodge ? (
                                    <>
                                        <h2 className="mt-8 text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Contact
                                        </h2>
                                        <a href="tel:09276966646" className="mt-3 inline-block text-sm text-[#53645d]">
                                            0927-696-6646
                                        </a>
                                    </>
                                ) : isHabitatBudgetInn ? (
                                    <>
                                        <h2 className="mt-8 text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Contact
                                        </h2>
                                        <a href="tel:09984398427" className="mt-3 inline-block text-sm text-[#53645d]">
                                            09984398427
                                        </a>
                                    </>
                                ) : resort.contact_information && (
                                    <>
                                        <h2 className="mt-8 text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Contact information
                                        </h2>
                                        <p className="mt-3 text-sm whitespace-pre-line text-[#53645d]">
                                            {resort.contact_information}
                                        </p>
                                    </>
                                )}

                                {!isVillageCondotel && !isHabitatBudgetInn && !isFlorinaCountryLodge && !isEllenFuentesTravellersInn && resort.price_information && (
                                    <>
                                        <h2 className="mt-8 text-sm font-bold tracking-[0.18em] text-[#173c34] uppercase">
                                            Price information
                                        </h2>
                                        <p className="mt-3 text-sm text-[#53645d]">
                                            {resort.price_information}
                                        </p>
                                    </>
                                )}

                                <div className="mt-8 flex flex-col gap-3">
                                    {canBookNow ? (
                                        <Link
                                            href={`/resorts/${resort.id}/book`}
                                            className="rounded-none bg-[#d99d4b] px-5 py-3 text-center text-sm font-semibold text-black"
                                        >
                                            Book Now
                                        </Link>
                                    ) : isHotel && isActive ? (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-none bg-[#e6e0d2] px-5 py-3 text-center text-sm font-semibold text-[#53645d]"
                                        >
                                            Currently Unavailable
                                        </button>
                                    ) : null}
                                    {!isHabitatBudgetInn && !isFlorinaCountryLodge && !isEllenFuentesTravellersInn && (canSubmitInquiry ? (
                                        <Link
                                            href={`/resorts/${resort.id}/inquire`}
                                            className="rounded-none border border-[#173c34] px-5 py-3 text-center text-sm font-semibold text-[#173c34]"
                                        >
                                            Send Inquiry
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-none border border-[#d7d2c5] bg-[#f3f0ea] px-5 py-3 text-center text-sm font-semibold text-[#53645d]"
                                        >
                                            Inquiries Closed
                                        </button>
                                    ))}
                                    <Link
                                        href="/resorts"
                                        className="rounded-none border border-[#d7d2c5] px-5 py-3 text-center text-sm font-semibold text-black"
                                    >
                                        Back to Resorts
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
