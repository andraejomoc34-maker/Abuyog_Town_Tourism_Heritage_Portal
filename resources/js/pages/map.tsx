import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowDown, Clock3, ExternalLink, MapPin, Navigation, Phone, Search } from 'lucide-react';
import PublicMobileMenu from '../components/PublicMobileMenu';

type MapRecord = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    image_url?: string | null;
    images?: { id: number; url: string }[];
    category: string;
    contact_information?: string | null;
    amenities?: string[] | null;
    price_information?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    kind: 'accommodation' | 'attraction';
    destinationType: 'spot' | 'resort';
};

type ResortRecord = Omit<MapRecord, 'category' | 'kind'> & {
    property_type?: string | null;
};

type TouristSpotRecord = Omit<MapRecord, 'kind'>;

type MapPageProps = {
    resorts?: ResortRecord[];
    touristSpots?: TouristSpotRecord[];
    search?: string;
};

const abuyogCenter: [number, number] = [10.747, 125.012];
const categoryColors: Record<string, string> = {
    Accommodation: '#173c34',
    Nature: '#2f8f80',
    Heritage: '#bd8b3d',
    Culture: '#7a6d5d',
    Food: '#c96b48',
    'Other Attractions': '#5a757d',
};

function normalizeSearchText(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function markerIcon(color: string) {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 3px 12px rgba(23,60,52,.38)"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

function hasValidCoordinates(item: MapRecord): item is MapRecord & { latitude: number; longitude: number } {
    return (
        typeof item.latitude === 'number' &&
        Number.isFinite(item.latitude) &&
        item.latitude >= -90 &&
        item.latitude <= 90 &&
        typeof item.longitude === 'number' &&
        Number.isFinite(item.longitude) &&
        item.longitude >= -180 &&
        item.longitude <= 180
    );
}

function mapsUrl(item: MapRecord): string {
    const destination = [item.name, item.location || 'Abuyog, Leyte'].filter(Boolean).join(', ');

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

function DestinationPhoto({ item, compact = false }: { item: MapRecord; compact?: boolean }) {
    const [imageFailed, setImageFailed] = useState(false);
    const heightClass = compact ? 'h-28' : 'h-48';

    return (
        <div className={`relative ${heightClass} overflow-hidden bg-[#e9e3d5]`}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-[#173c34]/65">
                <MapPin aria-hidden="true" className="h-6 w-6" />
                <span>Photo not available</span>
            </div>
            {(item.image_url || item.images?.[0]?.url) && !imageFailed && (
                <img
                    src={item.image_url || item.images?.[0]?.url}
                    alt={item.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                />
            )}
        </div>
    );
}

function VisitorDetails({ item }: { item: MapRecord }) {
    return (
        <div className="mt-3 space-y-2 border-t border-[#e9e3d5] pt-3 text-sm text-[#42534d]">
            <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                <span>{item.location || 'Address not provided'}</span>
            </p>
            <p className="flex items-start gap-2">
                <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                <span>Visiting hours not provided</span>
            </p>
            {item.contact_information && (
                <p className="flex items-start gap-2">
                    <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                    <span className="whitespace-pre-line">{item.contact_information}</span>
                </p>
            )}
            {item.amenities && item.amenities.length > 0 && (
                <p>
                    <span className="font-semibold text-[#173c34]">Amenities: </span>
                    {item.amenities.join(', ')}
                </p>
            )}
            {item.price_information && (
                <p>
                    <span className="font-semibold text-[#173c34]">Visitor information: </span>
                    {item.price_information}
                </p>
            )}
        </div>
    );
}

function DestinationViewTracker({ item, children }: { item: MapRecord; children: React.ReactNode }) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;

        if (!element || typeof IntersectionObserver === 'undefined') {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);

            if (!visible) {
                return;
            }

            observer.disconnect();
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                console.error('Destination view tracking could not find the CSRF token.');

                return;
            }

            void fetch('/destination-views', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ type: item.destinationType, id: item.id }),
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`Destination view tracking failed with status ${response.status}.`);
                }
            }).catch((error: unknown) => {
                console.error('Destination view tracking request failed.', error);
            });
        }, { threshold: 0.5 });

        observer.observe(element);

        return () => observer.disconnect();
    }, [item.destinationType, item.id]);

    return <div ref={elementRef}>{children}</div>;
}

export default function MapPage({ resorts = [], touristSpots = [], search: initialSearch = '' }: MapPageProps) {
    const [search, setSearch] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const locations = useMemo<MapRecord[]>(() => {
        const accommodationRecords: MapRecord[] = resorts.map((resort) => {
            const category = resort.property_type?.toLowerCase() === 'nature' ? 'Nature' : 'Accommodation';

            return {
                ...resort,
                category,
                kind: category === 'Nature' ? 'attraction' : 'accommodation',
                destinationType: 'resort',
            };
        });
        const attractionRecords: MapRecord[] = touristSpots.map((spot) => ({
            ...spot,
            category: spot.category || 'Other Attractions',
            kind: 'attraction',
            destinationType: 'spot',
        }));

        return [...accommodationRecords, ...attractionRecords];
    }, [resorts, touristSpots]);

    const categories = useMemo(
        () => ['All', ...new Set(locations.map((item) => item.category))],
        [locations],
    );
    const filteredLocations = useMemo(() => {
        const query = normalizeSearchText(search);

        return locations.filter((item) => {
            const categoryMatches = selectedCategory === 'All' || item.category === selectedCategory;
            const searchMatches =
                query === '' ||
                [item.name, item.location, item.category, item.description]
                    .filter(Boolean)
                    .some((value) => normalizeSearchText(value!).includes(query));

            return categoryMatches && searchMatches;
        });
    }, [locations, search, selectedCategory]);
    const mappedLocations = filteredLocations.filter(hasValidCoordinates);
    const unmappedCount = filteredLocations.length - mappedLocations.length;

    function clearFilters(): void {
        setSearch('');
        setSelectedCategory('All');

        if (initialSearch) {
            router.get('/map', {}, { replace: true, preserveState: false, preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Explore Abuyog" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <header className="border-b border-white/10 bg-[#123d36] text-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4b866] text-xl text-[#e4b866]">
                                ★
                            </span>
                            <span>
                                <strong className="block text-sm tracking-[0.24em]">ABUYOG TOURISM</strong>
                                <small className="mt-1 block text-[10px] tracking-[0.2em] text-white/65">
                                    TOURISM &amp; HERITAGE
                                </small>
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="hidden rounded-full border border-white/35 px-4 py-2 text-sm font-semibold transition hover:border-[#e4b866] hover:text-[#f6e5bd] sm:inline-flex"
                        >
                            Back to Home
                        </Link>
                        <PublicMobileMenu />
                    </div>
                </header>

                <main>
                    <section className="relative overflow-hidden bg-[#123d36] px-5 pb-16 pt-14 text-white sm:px-8 sm:pb-20 sm:pt-20">
                        <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border border-[#e4b866]/20" />
                        <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border border-[#e4b866]/15" />
                        <div className="relative mx-auto max-w-7xl">
                            <p className="text-xs font-bold tracking-[0.24em] text-[#e4b866]">EXPLORE LEYTE</p>
                            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
                                Your Next Adventure in Abuyog Awaits!
                            </h1>
                            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                                Discover the beauty, history, and culture of Abuyog, Leyte. Explore breathtaking destinations,
                                uncover heritage treasures, find comfortable accommodations, and discover local favorites—all in one place.
                            </p>
                            <a
                                href="#interactive-map"
                                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#e4b866] px-6 py-3 font-bold text-[#173c34] transition hover:-translate-y-0.5 hover:bg-[#f0d392] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                Start Exploring
                                <ArrowDown aria-hidden="true" className="h-4 w-4" />
                            </a>
                        </div>
                    </section>

                    <section
                        id="interactive-map"
                        className="mx-auto max-w-7xl scroll-mt-6 px-4 py-10 sm:px-6 sm:py-14 lg:px-10"
                    >
                        <p className="mb-8 border-l-4 border-[#bd8b3d] pl-4 text-base leading-7 text-[#42534d] sm:text-lg">
                            Every destination has a story. Tap a marker, discover a hidden gem, and plan your next unforgettable adventure in Abuyog!
                        </p>

                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">PLAN YOUR VISIT</p>
                                <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Explore the map</h2>
                                <p className="mt-2 text-sm text-[#64736d]">
                                    Browse {locations.length} places recorded by Abuyog Tourism.
                                </p>
                            </div>
                            <label className="relative block w-full lg:max-w-md">
                                <span className="sr-only">Search destinations by name, category, address, or description</span>
                                <Search aria-hidden="true" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718078]" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search destinations or categories..."
                                    className="min-h-12 w-full rounded-full border border-[#d7d2c5] bg-white py-3 pl-12 pr-5 text-sm text-[#173c34] outline-none transition placeholder:text-[#718078] focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#bd8b3d]/25"
                                />
                            </label>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter destinations by category">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    aria-pressed={selectedCategory === category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bd8b3d] ${
                                        selectedCategory === category
                                            ? 'border-[#173c34] bg-[#173c34] text-white'
                                            : 'border-[#d7d2c5] bg-white text-[#173c34] hover:border-[#bd8b3d]'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-[#e3ddcf] bg-white px-4 py-3">
                            {categories
                                .filter((category) => category !== 'All')
                                .map((category) => (
                                    <span key={category} className="inline-flex items-center gap-2 text-sm text-[#42534d]">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: categoryColors[category] ?? '#5a757d' }}
                                        />
                                        {category}
                                    </span>
                                ))}
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.9fr)]">
                            <section className="overflow-hidden rounded-3xl border border-[#e3ddcf] bg-white shadow-[0_18px_40px_rgba(23,60,52,0.08)]" aria-label="Interactive map">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebdfcf] bg-[#f8f3e8] px-4 py-3 sm:px-5">
                                    <span className="text-sm font-bold tracking-wide">ABUYOG, LEYTE</span>
                                    <span className="text-xs text-[#64736d]">
                                        {mappedLocations.length} mapped · {unmappedCount} without verified pins
                                    </span>
                                </div>
                                <div className="h-[360px] w-full sm:h-[480px] lg:h-[620px]">
                                    <MapContainer center={abuyogCenter} zoom={12} scrollWheelZoom className="h-full w-full">
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        {mappedLocations.map((item) => (
                                            <Marker
                                                key={`${item.kind}-${item.id}`}
                                                position={[item.latitude, item.longitude]}
                                                icon={markerIcon(categoryColors[item.category] ?? '#5a757d')}
                                            >
                                                <Popup>
                                                    <article className="w-64 overflow-hidden rounded-lg text-[#173c34]">
                                                        <DestinationPhoto item={item} compact />
                                                        <div className="p-3">
                                                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b6a28]">
                                                                {item.category}
                                                            </span>
                                                            <h3 className="mt-1 text-base font-bold">{item.name}</h3>
                                                            <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#64736d]">
                                                                {item.description || 'Description not provided.'}
                                                            </p>
                                                            {item.images && item.images.length > 1 && (
                                                                <div className="mt-3 grid grid-cols-3 gap-1.5">
                                                                    {item.images.slice(0, 3).map((image) => (
                                                                        <img key={image.id} src={image.url} alt={`${item.name} photo`} loading="lazy" className="aspect-square w-full rounded object-cover" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <VisitorDetails item={item} />
                                                            <a
                                                                href={mapsUrl(item)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#173c34] underline decoration-[#bd8b3d] underline-offset-4"
                                                            >
                                                                <Navigation aria-hidden="true" className="h-4 w-4" />
                                                                Open in Google Maps
                                                            </a>
                                                        </div>
                                                    </article>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                                {unmappedCount > 0 && (
                                    <p className="border-t border-[#e3ddcf] bg-[#fffaf0] px-4 py-3 text-sm leading-6 text-[#5e5647] sm:px-5">
                                        {unmappedCount} {unmappedCount === 1 ? 'place does' : 'places do'} not have verified coordinates in the records yet, so {unmappedCount === 1 ? 'it is' : 'they are'} listed below without a map pin. Use the address link to look it up in Google Maps.
                                    </p>
                                )}
                            </section>

                            <section aria-label="Destination directory" className="min-w-0">
                                <div className="mb-3 flex items-end justify-between gap-3">
                                    <div>
                                        <h2 className="font-serif text-2xl">Places to discover</h2>
                                        <p className="mt-1 text-sm text-[#64736d]">{filteredLocations.length} results</p>
                                    </div>
                                    {(search || selectedCategory !== 'All') && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="rounded-full px-3 py-2 text-sm font-semibold text-[#173c34] underline decoration-[#bd8b3d] underline-offset-4"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[620px] space-y-4 overflow-y-auto pr-1">
                                    {filteredLocations.map((item) => (
                                        <DestinationViewTracker key={`${item.kind}-${item.id}`} item={item}>
                                            <article className="overflow-hidden rounded-2xl border border-[#e3ddcf] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                            <div className="grid sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[8rem_minmax(0,1fr)]">
                                                <DestinationPhoto item={item} compact />
                                                <div className="min-w-0 p-4">
                                                    <span
                                                        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]"
                                                        style={{ color: categoryColors[item.category] ?? '#5a757d' }}
                                                    >
                                                        <span
                                                            className="h-2.5 w-2.5 rounded-full"
                                                            style={{ backgroundColor: categoryColors[item.category] ?? '#5a757d' }}
                                                        />
                                                        {item.category}
                                                    </span>
                                                    <h3 className="mt-1 text-lg font-bold leading-snug">{item.name}</h3>
                                                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#64736d]">
                                                        {item.description || 'Description not provided.'}
                                                    </p>
                                                    <VisitorDetails item={item} />
                                                    {!hasValidCoordinates(item) && (
                                                        <p className="mt-3 rounded-lg bg-[#fff7e8] px-3 py-2 text-xs font-semibold text-[#72531f]">
                                                            Verified map pin not available
                                                        </p>
                                                    )}
                                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                                                        <a
                                                            href={mapsUrl(item)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#173c34] underline decoration-[#bd8b3d] underline-offset-4"
                                                        >
                                                            <Navigation aria-hidden="true" className="h-4 w-4" />
                                                            Open in Google Maps
                                                            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                                                        </a>
                                                        {item.kind === 'accommodation' && (
                                                            <Link
                                                                href={`/resorts/${item.id}`}
                                                                className="text-sm font-semibold text-[#173c34] underline decoration-[#bd8b3d] underline-offset-4"
                                                            >
                                                                View accommodation
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {item.images && item.images.length > 1 && (
                                                <div className="grid grid-cols-4 gap-1.5 border-t border-[#eee9df] p-2 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
                                                    {item.images.slice(0, 5).map((image) => (
                                                        <img key={image.id} src={image.url} alt={`${item.name} photo`} loading="lazy" className="aspect-[4/3] w-full rounded-md object-cover" />
                                                    ))}
                                                </div>
                                            )}
                                            </article>
                                        </DestinationViewTracker>
                                    ))}
                                    {filteredLocations.length === 0 && (
                                        <div className="rounded-2xl border border-dashed border-[#d7d2c5] bg-white p-8 text-center">
                                            <Search aria-hidden="true" className="mx-auto h-7 w-7 text-[#bd8b3d]" />
                                            <h3 className="mt-3 font-bold">No destinations found</h3>
                                            <p className="mt-1 text-sm text-[#64736d]">Try another name or choose a different category.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
