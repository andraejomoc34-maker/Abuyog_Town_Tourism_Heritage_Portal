import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PublicMobileMenu from '../components/PublicMobileMenu';

type ResortMarker = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    image_url?: string | null;
    status?: string | null;
    type: 'Resort';
    lat: number;
    lng: number;
};

type TouristMarker = {
    id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    category?: string | null;
    image_url?: string | null;
    status?: string | null;
    type: 'Nature' | 'Heritage' | 'Culture' | 'Food' | 'Other Attractions';
    lat: number;
    lng: number;
};

type MapItem = ResortMarker | TouristMarker;

const abuyogCenter: [number, number] = [10.747, 125.012];
const categoryColors: Record<string, string> = {
    Nature: '#2f8f80',
    Heritage: '#d99d4b',
    Culture: '#7a6d5d',
    Resort: '#173c34',
    Food: '#c96b48',
    'Other Attractions': '#5a757d',
};

function markerIcon(color: string) {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `<span style="display:block; width:16px; height:16px; border-radius:9999px; background:${color}; border:2px solid white; box-shadow:0 4px 12px rgba(23,60,52,0.25);"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

export default function MapPage({
    resorts = [],
    touristSpots = [],
}: {
    resorts?: Array<{
        id: number;
        name: string;
        description?: string | null;
        location?: string | null;
        image_url?: string | null;
        status?: string | null;
    }>;
    touristSpots?: Array<{
        id: number;
        name: string;
        description?: string | null;
        location?: string | null;
        category?: string | null;
        image_url?: string | null;
        status?: string | null;
    }>;
}) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const markers = useMemo<MapItem[]>(() => {
        const resortMarkers: ResortMarker[] = (resorts || []).map((resort, index) => ({
            id: resort.id,
            name: resort.name,
            description: resort.description,
            location: resort.location,
            image_url: resort.image_url,
            status: resort.status,
            type: 'Resort',
            lat: abuyogCenter[0] + ((index % 3) - 1) * 0.008,
            lng: abuyogCenter[1] + ((index % 5) - 2) * 0.010,
        }));

        const spotMarkers: TouristMarker[] = (touristSpots || []).map((spot, index) => {
            const category = (spot.category ?? 'Other Attractions') as TouristMarker['type'];

            return {
                id: spot.id,
                name: spot.name,
                description: spot.description,
                location: spot.location,
                image_url: spot.image_url,
                status: spot.status,
                type: category,
                lat: abuyogCenter[0] + ((index % 4) - 1.5) * 0.006,
                lng: abuyogCenter[1] + ((index % 6) - 2.5) * 0.012,
            };
        });

        return [
            {
                id: 0,
                name: 'Abuyog',
                description: 'Explore the tourism, heritage, culture, and natural attractions of Abuyog.',
                location: 'Abuyog, Leyte',
                type: 'Resort',
                lat: abuyogCenter[0],
                lng: abuyogCenter[1],
            },
            ...resortMarkers,
            ...spotMarkers,
        ];
    }, [resorts, touristSpots]);

    const filteredMarkers = useMemo(() => {
        return markers.filter((item) => {
            const categoryMatches =
                selectedCategory === 'All' ||
                item.type === selectedCategory ||
                (item.type === 'Resort' && selectedCategory === 'Resort');

            const searchText = `${item.name} ${item.location ?? ''} ${item.type ?? ''}`.toLowerCase();
            const searchMatches = searchText.includes(search.trim().toLowerCase());

            return categoryMatches && searchMatches;
        });
    }, [markers, search, selectedCategory]);

    const categories = ['All', 'Nature', 'Heritage', 'Culture', 'Resort', 'Food', 'Other Attractions'];

    return (
        <>
            <Head title="Explore the Map" />
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
                    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                EXPLORE LEYTE
                            </p>
                            <h1 className="mt-3 font-serif text-4xl text-[#173c34] sm:text-5xl">
                                Explore the Map
                            </h1>
                        </div>
                        <div className="w-full max-w-md">
                            <label className="mb-2 block text-xs font-bold tracking-[0.16em] text-[#173c34]/80 uppercase">
                                Search destinations
                            </label>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search destinations..."
                                className="w-full rounded-full border border-[#d7d2c5] bg-white px-4 py-3 text-sm text-[#173c34] outline-none transition focus:border-[#d99d4b] focus:ring-2 focus:ring-[#d99d4b]/20"
                            />
                        </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-none border px-3 py-2 text-xs font-semibold transition ${
                                    selectedCategory === category
                                        ? 'border-[#173c34] bg-[#173c34] text-white'
                                        : 'border-[#d7d2c5] bg-white text-[#173c34] hover:border-[#d99d4b] hover:text-[#173c34]'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#e3ddcf] bg-white p-3">
                        <div className="flex flex-wrap gap-3 text-xs text-[#173c34]">
                            {Object.entries(categoryColors).slice(0, 5).map(([label, color]) => (
                                <span key={label} className="inline-flex items-center gap-2">
                                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[28px] border border-[#e3ddcf] bg-white shadow-[0_18px_40px_rgba(23,60,52,0.08)]">
                        <div className="flex items-center justify-between border-b border-[#ebdfcf] bg-[#f8f3e8] px-4 py-3">
                            <div className="text-xs font-bold tracking-[0.16em] text-[#173c34] uppercase">
                                Leyte, Philippines
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setSelectedCategory('All');
                                }}
                                className="rounded-none border border-[#173c34] px-3 py-1.5 text-[11px] font-semibold text-[#173c34] transition hover:bg-[#173c34] hover:text-white"
                            >
                                Reset View
                            </button>
                        </div>
                        <div className="h-[560px] w-full">
                            <MapContainer center={abuyogCenter} zoom={11} scrollWheelZoom className="h-full w-full"> 
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {filteredMarkers.map((item) => (
                                    <Marker
                                        key={`${item.type}-${item.id}-${item.name}`}
                                        position={[item.lat, item.lng]}
                                        icon={markerIcon(categoryColors[item.type] ?? '#173c34')}
                                    >
                                        <Popup>
                                            <div className="max-w-[220px] text-[#173c34]">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <strong className="text-base font-semibold">{item.name}</strong>
                                                    <span className="rounded-full bg-[#f7efe0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b6a28]">
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <p className="text-xs uppercase tracking-[0.12em] text-[#173c34]/70">{item.location ?? 'Abuyog, Leyte'}</p>
                                                <p className="mt-2 text-xs leading-5 text-[#718078]">
                                                    {item.description ?? 'Explore the tourism, heritage, culture, and natural attractions of Abuyog.'}
                                                </p>
                                                {item.name === 'Abuyog' ? (
                                                    <Link href="/discover" className="mt-3 inline-flex rounded-none bg-[#173c34] px-3 py-2 text-[11px] font-semibold text-white">
                                                        Explore Abuyog →
                                                    </Link>
                                                ) : item.type === 'Resort' ? (
                                                    <a href={`/resorts/${item.id}`} className="mt-3 inline-flex rounded-none bg-[#173c34] px-3 py-2 text-[11px] font-semibold text-white">
                                                        View Resort
                                                    </a>
                                                ) : (
                                                    <Link href="/discover" className="mt-3 inline-flex rounded-none bg-[#173c34] px-3 py-2 text-[11px] font-semibold text-white">
                                                        View Details
                                                    </Link>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
