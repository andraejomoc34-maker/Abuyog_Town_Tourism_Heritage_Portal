import { useEffect, useState, type FormEvent } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import PublicMobileMenu from '../components/PublicMobileMenu';
import {
    BusFront,
    Heart,
    Hotel,
    Landmark,
    Map,
    MapPin,
    Theater,
    TreePalm,
} from 'lucide-react';

const heroImages = [
    
     '/canigao.jpg',
    '/canigao-1.jpg',
     '/pic.jpg',
     '/Fuentes.jpg',
     '/Florida.jpg',
     '/Abuyog-hotel-1.jpg',
     '/The village.jpg',
     '/abuyog-2.jpg',
     '/Abuyog-hotel-2.jpg',
     '/The village-1.jpg',
     '/Abuyog-hotel-room-1.jpg',

];

const experiences = [
    {
        icon: TreePalm,
        title: 'Nature',
        description: 'Explore beautiful natural destinations.',
    },
    {
        icon: Landmark,
        title: 'Heritage',
        description: "Discover Abuyog's stories and history.",
    },
    {
        icon: Theater,
        title: 'Culture',
        description: 'Experience local traditions and festivals.',
    },
    {
        icon: Heart,
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

const destinationRoutes: Record<string, string> = {
    'Natural Wonders': '/discover/nature',
    'Heritage & History': '/discover/heritage',
    'Culture & Festival': '/discover/culture',
};


const historyTimeline = [
    {
        year: '1588',
        title: 'Local Revolt',
        description:
            'A local revolt took place in Abuyog during the early Spanish colonial period.',
        image: '/history/visayans-leyte-boxer-codex.png',
        alt: 'Pintados of the Visayas in a Boxer Codex illustration dated around 1595',
        caption:
            'Historical illustration — Pintados of Leyte or Samar, c. 1595; not a depiction of the 1588 revolt.',
        source: 'Boxer Codex · Public domain',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:Visayans_1.png',
    },
    {
        year: '1613',
        title: 'Sanguiles and Caragas',
        description:
            'Sanguiles and Caragas plundered and marauded the town.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Reception_of_the_Manila_Galleon_by_the_Chamorro_in_the_Ladrones_Islands%2C_ca._1590.jpg',
        alt: 'Boxer Codex illustration of a Manila galleon meeting a Chamorro coastal community around 1590',
        caption:
            'Historical illustration — Manila galleon and Chamorro coastal encounter, c. 1590; regional context, not the 1613 raid.',
        source: 'Boxer Codex · Public domain',
        sourceUrl:
            'https://commons.wikimedia.org/wiki/File:Reception_of_the_Manila_Galleon_by_the_Chamorro_in_the_Ladrones_Islands,_ca._1590.jpg',
    },
    {
        year: '1655',
        title: 'Jesuit Mission',
        description:
            'Jesuits established Abuyog as their second mission post.',
        image: '/history/jesuit-map-philippines-1734.jpg',
        alt: 'Philippine Islands map drawn by Jesuit Pedro Murillo Velarde and published in 1734',
        caption:
            'Historical map — Jesuit-authored chart of the Philippines, 1734; geographic context, not the 1655 mission post.',
        source: 'Pedro Murillo Velarde · Public domain · Library of Congress',
        sourceUrl:
            'https://commons.wikimedia.org/wiki/File:Carta_Hydrographica_y_Chorographica_de_las_Yslas_Filipinas_Dedicada_al_Rey_Nuestro_Se%C3%B1or_por_el_Mariscal_d._Campo_D._Fernando_Valdes_Tamon_Cavall%C2%BA_del_Orden_de_Santiago_de_Govor._Y_Capn.jpg',
    },
    {
        year: '1716',
        title: 'Town and Parish Founded',
        description:
            'Abuyog was founded as a town and parish under the patronage of Saint Francis Xavier.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/St._Francis_Xavier_Parish_at_Abuyog.jpg',
        alt: 'Present-day facade of St. Francis Xavier Parish Church in Abuyog, Leyte',
        caption: 'St. Francis Xavier Parish, Abuyog, Leyte — present-day exterior.',
        source: 'Photo: JinJian · CC BY-SA 4.0 · Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:St._Francis_Xavier_Parish_at_Abuyog.jpg',
    },
    {
        year: '1768',
        title: 'Augustinian Period',
        description: 'The Augustinians took over the parish.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Altar_of_St._Francis_Xavier_Parish_Church_at_Abuyog.jpg',
        alt: 'Present-day altar inside St. Francis Xavier Parish Church in Abuyog, Leyte',
        caption: 'St. Francis Xavier Parish — present-day photograph.',
        source: 'Photo: JinJian · CC BY-SA 4.0 · Wikimedia Commons',
        sourceUrl:
            'https://commons.wikimedia.org/wiki/File:Altar_of_St._Francis_Xavier_Parish_Church_at_Abuyog.jpg',
    },
    {
        year: '1843',
        title: 'Franciscan Period',
        description:
            'Abuyog was entrusted to the Franciscan Order, with Fr. Santiago Malonda becoming its first Franciscan parish priest.',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/St._Francis_Xavier_Parish_at_Abuyog.jpg',
        alt: 'Present-day exterior of St. Francis Xavier Parish Church in Abuyog, Leyte',
        caption:
            'St. Francis Xavier Parish, Abuyog, Leyte — present-day exterior, not a photograph from 1843.',
        source: 'Photo: JinJian · CC BY-SA 4.0 · Wikimedia Commons',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:St._Francis_Xavier_Parish_at_Abuyog.jpg',
    },
    {
        year: '1851',
        title: 'Abuyog–Dulag Horse Path',
        description: 'A horse path opened between Abuyog and Dulag.',
        image: '/Abuyog_Real_Street.jpg',
        alt: 'Present-day coastal road through a tropical Leyte landscape',
        caption:
            'Present-day coastal road — related visual reference only, not the 1851 Abuyog–Dulag horse path.',
       
    },
    {
        year: 'TODAY',
        title: 'Heritage and Tourism',
        description:
            'Abuyog welcomes visitors to its landmarks, local culture, and natural scenery.',
        image: '/abuyog-6.jpeg',
        alt: 'Abuyog commemorative monument framed by palms and the coast',
        caption: 'Abuyog, Leyte — Heritage and Tourism Today.',
        
    },
];
const food = [
    {
        name: 'Kinillaw na Isda',
        description:
            'Fresh catch brightened with native citrus, ginger, and coconut.',
        image: 'kinillaw isda-1.jpg',
        alt: 'Fresh seafood dish served with citrus and herbs',
    },
    {
        name: 'Bibingka',
        description:
            'A beloved rice cake with the warmth of coconut and local tradition.',
        image: 'bibingka-1.jpg',
        alt: 'Golden traditional rice cakes on a serving plate',
    },
    {
        name: 'Coconut Delights',
        description:
            "Simple, generous flavors inspired by Leyte's abundant coconut groves.",
        image: 'coconot-1.jpg',
        alt: 'Fresh coconut and tropical ingredients on a table',
    },
];

const travelGuide = [
    {
        icon: BusFront,
        title: 'Getting to Abuyog',
        text: 'Find the best ways to reach Abuyog, Leyte.',
        href: '/travel-guide',
    },
    {
        icon: Map,
        title: 'Explore the Map',
        text: 'Discover destinations and attractions around Leyte.',
        href: '/map',
    },
    {
        icon: Hotel,
        title: 'Where to Stay',
        text: 'Find resorts, cottages, and places to stay.',
        href: '/resorts',
    },
    {
        icon: MapPin,
        title: 'Things to Explore',
        text: 'Discover nature, heritage, culture, and local experiences.',
        href: '/discover',
    },
];

export default function Welcome() {
    const { auth, announcements = [] } = usePage().props;
    const [activeHeroImage, setActiveHeroImage] = useState(0);
    const [isHeroImageVisible, setIsHeroImageVisible] = useState(true);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const feedbackForm = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        rating: 0,
        message: '',
    });

    useEffect(() => {
        let transitionTimeoutId: number | undefined;
        const intervalId = window.setInterval(() => {
            setIsHeroImageVisible(false);
            transitionTimeoutId = window.setTimeout(() => {
                setActiveHeroImage(
                    (currentImage) => (currentImage + 1) % heroImages.length,
                );
                transitionTimeoutId = window.setTimeout(
                    () => setIsHeroImageVisible(true),
                    50,
                );
            }, 300);
        }, 3000);

        return () => {
            window.clearInterval(intervalId);

            if (transitionTimeoutId !== undefined) {
                window.clearTimeout(transitionTimeoutId);
            }
        };
    }, []);

    function submitFeedback(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedbackSubmitted(false);
        feedbackForm.post('/feedback', {
            preserveScroll: true,
            onSuccess: () => {
                feedbackForm.reset();
                feedbackForm.clearErrors();
                setFeedbackSubmitted(true);
            },
        });
    }

    return (
        <>
            <Head title="">
            </Head>
            <style>{`
                .homepage-root h1,
                .homepage-root h2,
                .homepage-root h3 {
                    font-family: 'Barabara', sans-serif;
                }
            `}</style>
            <div
                className="homepage-root min-h-screen overflow-hidden bg-[#fbf8f0] text-[#173c34]"
                style={{ fontFamily: "'Barabara', sans-serif" }}
            >
                <section className="relative flex min-h-[560px] flex-col bg-[#123d36] text-white sm:min-h-[680px] lg:min-h-[730px]">
                    <img
                        src={heroImages[activeHeroImage]}
                        alt=""
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in-out ${
                            isHeroImageVisible ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,34,.9)_0%,rgba(11,50,43,.55)_48%,rgba(8,36,32,.25)_100%),linear-gradient(0deg,rgba(8,36,32,.82)_0%,transparent_55%)]" />
                    <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/Bee%20Symbol.jpg"
                                alt="Bee Symbol"
                                className="h-9 w-9 shrink-0 object-contain sm:h-[38px] sm:w-[38px] lg:h-[42px] lg:w-[42px]"
                            />
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
                        <div className="hidden items-center gap-2 text-xs font-semibold lg:flex">
                            {auth.user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="rounded-none px-4 py-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                                    >
                                        {auth.user.name}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => router.post('/logout')}
                                        className="rounded-none bg-white px-5 py-2.5 text-[#173c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f6e5bd]"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="rounded-none px-4 py-2.5 text-white/90 transition hover:bg-white/10 hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-none bg-white px-5 py-2.5 text-[#173c34] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f6e5bd]"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                        <PublicMobileMenu />
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
                            <h1 className="max-w-xl font-serif text-5xl leading-[.96] font-normal tracking-[-.04em] sm:text-7xl lg:text-[8rem]">
                                DISCOVER
                                <br />
                                <span className="text-[#e4b866]">ABUYOG</span>
                            </h1>
                            <p className="mt-8 max-w-md text-base leading-7 text-white/80 sm:text-lg">
                                Experience the beauty, history, culture, and
                                heritage of Abuyog, Leyte.
                            </p>
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#discover"
                                    className="w-full rounded-none bg-[#d99d4b] px-6 py-3.5 text-center text-sm font-semibold text-[#173c34] transition hover:-translate-y-1 hover:bg-[#edbd73] sm:w-auto"
                                >
                                    Explore Abuyog{' '}
                                    <span className="ml-2">{'\u2197'}</span>
                                </a>
                                <a
                                    href="#heritage"
                                    className="w-full rounded-none border border-white/45 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-white hover:bg-white/10 sm:w-auto"
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

                {announcements.length > 0 && (
                    <section className="bg-[#f8f3e8] px-6 py-16 sm:py-20 lg:px-10">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e4dac8] pb-5">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.22em] text-[#9b6a28]">
                                        ABUYOG MUNICIPAL TOURISM OFFICE
                                    </p>
                                    <h2 className="mt-3 font-serif text-3xl font-normal text-[#173c34] sm:text-4xl">
                                        Latest Announcements
                                    </h2>
                                </div>
                                <span className="text-sm text-[#68766f]">
                                    Tourism news, events, and public updates
                                </span>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {announcements.map((announcement) => (
                                    <article
                                        className="overflow-hidden rounded-lg border border-[#e5ddce] bg-white shadow-[0_10px_30px_rgba(23,60,52,.06)]"
                                        key={announcement.id}
                                    >
                                        {announcement.featuredImageUrl ? (
                                            <img
                                                alt=""
                                                className="aspect-[16/9] w-full object-cover"
                                                loading="lazy"
                                                src={announcement.featuredImageUrl}
                                            />
                                        ) : (
                                            <div className="flex aspect-[16/9] items-center justify-center bg-[#173c34] text-[#edbd73]">
                                                <span className="text-xs font-semibold tracking-[0.2em]">
                                                    ABUYOG TOURISM
                                                </span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <p className="text-[10px] font-bold tracking-[0.18em] text-[#9b6a28] uppercase">
                                                {announcement.category}
                                            </p>
                                            <h3 className="mt-2 font-serif text-xl text-[#173c34]">
                                                {announcement.title}
                                            </h3>
                                            {announcement.excerpt && (
                                                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#68766f]">
                                                    {announcement.excerpt}
                                                </p>
                                            )}
                                            <p className="mt-4 text-xs text-[#87928b]">
                                                Posted by Abuyog Municipal Tourism Office
                                            </p>
                                            <Link
                                                className="mt-4 inline-flex min-h-9 items-center text-sm font-semibold text-[#245548] underline decoration-[#d99d4b] underline-offset-4"
                                                href={`/announcements/${announcement.slug}`}
                                            >
                                                Read More <span className="ml-2">{'\u2192'}</span>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

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
                            {experiences.map((experience) => {
                                const Icon = experience.icon;

                                return (
                                    <article
                                        key={experience.title}
                                        className="border-t border-[#dedfd8] pt-5 transition hover:-translate-y-1"
                                    >
                                        <span className="inline-flex rounded-full bg-[#f7ead1] p-3 text-[#173c34]">
                                            <Icon className="h-6 w-6" />
                                        </span>
                                        <h3 className="mt-5 text-lg font-semibold text-[#173c34]">
                                            {experience.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-[#718078]">
                                            {experience.description}
                                        </p>
                                    </article>
                                );
                            })}
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
                                        <Link
                                            href={
                                                destinationRoutes[
                                                    destination.title
                                                ] ?? '/'
                                            }
                                            className="mt-5 inline-flex items-center text-xs font-bold tracking-[0.12em] text-[#9b6a28] transition group-hover:text-[#173c34]"
                                        >
                                            EXPLORE{' '}
                                            <span className="ml-2 text-base">
                                                {'\u2197'}
                                            </span>
                                        </Link>
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
                    <div className="mx-auto max-w-7xl">
                        <div className="mx-auto max-w-3xl text-center">
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
                                Discover the milestones that shaped Abuyog,
                                from early local history to its heritage and
                                tourism today.
                            </p>
                        </div>

                        <ol className="mt-12 space-y-5 sm:mt-16">
                            {historyTimeline.map((item, index) => {
                                const imageOnRight = index % 2 === 1;

                                return (
                                    <li
                                        className="grid gap-5 rounded-2xl border border-white/15 bg-white/[0.04] p-4 sm:p-6 lg:grid-cols-2 lg:items-center lg:gap-9"
                                        key={item.year}
                                    >
                                        <figure
                                            className={
                                                imageOnRight ? 'lg:order-2' : ''
                                            }
                                        >
                                            <img
                                                alt={item.alt}
                                                className={`aspect-[16/10] w-full rounded-xl object-cover ${index < 2 ? 'object-top' : 'object-center'}`}
                                                decoding="async"
                                                loading="lazy"
                                                src={item.image}
                                            />
                                            <figcaption className="mt-3 space-y-1.5 text-xs leading-5 text-white/75">
                                                <span className="block text-[#edbd73]">
                                                    {item.caption}
                                                </span>
                                                {item.sourceUrl ? (
                                                    <a
                                                        className="inline-block text-white/55 underline decoration-white/30 underline-offset-2 transition hover:text-white"
                                                        href={item.sourceUrl}
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {item.source}
                                                    </a>
                                                ) : (
                                                    <span className="block text-white/45">
                                                        {item.source}
                                                    </span>
                                                )}
                                            </figcaption>
                                        </figure>
                                        <div
                                            className={
                                                imageOnRight ? 'lg:order-1' : ''
                                            }
                                        >
                                            <p className="text-xs font-bold tracking-[0.2em] text-[#edbd73]">
                                                {item.year}
                                            </p>
                                            <h3 className="mt-3 font-serif text-2xl font-normal uppercase leading-tight sm:text-3xl">
                                                {item.title}
                                            </h3>
                                            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                                                {item.description}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
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
                            className="mt-9 inline-flex rounded-none bg-black px-7 py-3.5 text-sm font-semibold text-[#173c34] transition hover:-translate-y-1 hover:bg-[#f6e5bd]"
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
                        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {travelGuide.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="group flex h-full rounded-2xl border border-[#e3ddcf] bg-white p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#d99d4b] hover:shadow-[0_18px_35px_rgba(23,60,52,0.12)] hover:shadow-[#d99d4b]/15"
                                    >
                                        <div className="flex h-full flex-col">
                                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe0] text-[#173c34] shadow-sm transition group-hover:bg-[#173c34] group-hover:text-[#f8f3e8]">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <h3 className="mt-5 font-semibold text-[#173c34]">
                                                {item.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-6 text-[#718078]">
                                                {item.text}
                                            </p>
                                            <span className="mt-auto pt-5 text-xs font-bold tracking-widest text-[#9b6a28]">
                                                LEARN MORE {'\u2192'}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="bg-[#f0eadc] px-6 py-20 text-center sm:py-24">
                    <div className="mx-auto max-w-4xl">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                            YOUR NEXT STORY AWAITS
                        </p>
                        <h2 className="mt-4 font-serif text-4xl font-normal text-[#173c34] sm:text-6xl">
                            Ready to discover Abuyog?
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#718078]">
                            Explore destinations, discover history, experience
                            culture, and create unforgettable memories in
                            Abuyog.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href="/discover"
                                className="inline-flex rounded-none bg-[#123d36] px-7 py-4 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#1b574b] hover:shadow-[0_18px_30px_rgba(23,60,52,0.18)]"
                            >
                                EXPLORE ABUYOG {'\u2192'}
                            </Link>
                            <Link
                                href="/resorts"
                                className="inline-flex rounded-none border border-[#173c34] bg-transparent px-7 py-4 text-sm font-semibold text-[#173c34] transition duration-300 hover:-translate-y-1 hover:border-[#d99d4b] hover:bg-[#173c34] hover:text-white"
                            >
                                VIEW RESORTS {'\u2192'}
                            </Link>
                        </div>
                    </div>
                </section>

                <section
                    id="feedback"
                    className="bg-[#f8f3e8] px-6 py-14 sm:py-16 lg:px-10"
                >
                    <div className="mx-auto max-w-3xl rounded-2xl border border-[#e7ddca] bg-white px-6 py-8 shadow-[0_16px_45px_rgba(23,60,52,.08)] sm:px-10 sm:py-10">
                        <div className="text-center">
                            <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                                VISITOR FEEDBACK
                            </p>
                            <h2 className="mt-3 font-serif text-3xl font-normal text-[#173c34] sm:text-4xl">
                                Share Your Experience
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#68766f]">
                                Tell us about your experience exploring Abuyog.
                                Your feedback helps us improve the Abuyog
                                Tourism &amp; Heritage Portal.
                            </p>
                        </div>

                        {feedbackSubmitted && (
                            <p
                                className="mt-6 rounded-lg border border-[#d4e5d6] bg-[#f1f8f1] px-4 py-3 text-center text-sm font-medium text-[#245b3d]"
                                role="status"
                            >
                                Thank you for your feedback!
                            </p>
                        )}

                        <form
                            className="mt-7 space-y-5"
                            onSubmit={submitFeedback}
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        className="mb-2 block text-sm font-medium text-[#173c34]"
                                        htmlFor="feedback-name"
                                    >
                                        Name
                                    </label>
                                    <input
                                        aria-invalid={Boolean(feedbackForm.errors.name)}
                                        autoComplete="name"
                                        className="w-full rounded-lg border border-[#dedfd8] bg-white px-3.5 py-3 text-sm text-[#173c34] outline-none transition focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20 read-only:bg-[#f8f7f2]"
                                        id="feedback-name"
                                        onChange={(event) => {
                                            feedbackForm.setData('name', event.target.value);
                                            setFeedbackSubmitted(false);
                                        }}
                                        readOnly={Boolean(auth.user)}
                                        value={feedbackForm.data.name}
                                    />
                                    {feedbackForm.errors.name && (
                                        <p className="mt-1.5 text-xs text-red-700">
                                            {feedbackForm.errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label
                                        className="mb-2 block text-sm font-medium text-[#173c34]"
                                        htmlFor="feedback-email"
                                    >
                                        Email
                                    </label>
                                    <input
                                        aria-invalid={Boolean(feedbackForm.errors.email)}
                                        autoComplete="email"
                                        className="w-full rounded-lg border border-[#dedfd8] bg-white px-3.5 py-3 text-sm text-[#173c34] outline-none transition focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20 read-only:bg-[#f8f7f2]"
                                        id="feedback-email"
                                        onChange={(event) => {
                                            feedbackForm.setData('email', event.target.value);
                                            setFeedbackSubmitted(false);
                                        }}
                                        readOnly={Boolean(auth.user)}
                                        type="email"
                                        value={feedbackForm.data.email}
                                    />
                                    {feedbackForm.errors.email && (
                                        <p className="mt-1.5 text-xs text-red-700">
                                            {feedbackForm.errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <fieldset>
                                <legend className="mb-2 block text-sm font-medium text-[#173c34]">
                                    Rating
                                </legend>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <label
                                            className="cursor-pointer rounded-sm"
                                            key={rating}
                                        >
                                            <input
                                                checked={feedbackForm.data.rating === rating}
                                                className="peer sr-only"
                                                name="rating"
                                                onChange={() => {
                                                    feedbackForm.setData('rating', rating);
                                                    setFeedbackSubmitted(false);
                                                }}
                                                type="radio"
                                                value={rating}
                                            />
                                            <span
                                                aria-hidden="true"
                                                className={`inline-block px-0.5 text-3xl leading-none transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#bd8b3d] ${rating <= feedbackForm.data.rating ? 'text-[#d99d4b]' : 'text-[#a8ada7]'}`}
                                            >
                                                {rating <= feedbackForm.data.rating
                                                    ? '\u2605'
                                                    : '\u2606'}
                                            </span>
                                            <span className="sr-only">
                                                {rating} {rating === 1 ? 'Star' : 'Stars'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {feedbackForm.errors.rating && (
                                    <p className="mt-1.5 text-xs text-red-700">
                                        {feedbackForm.errors.rating}
                                    </p>
                                )}
                            </fieldset>

                            <div>
                                <label
                                    className="mb-2 block text-sm font-medium text-[#173c34]"
                                    htmlFor="feedback-message"
                                >
                                    Your Feedback
                                </label>
                                <textarea
                                    aria-invalid={Boolean(feedbackForm.errors.message)}
                                    className="min-h-28 w-full resize-y rounded-lg border border-[#dedfd8] bg-white px-3.5 py-3 text-sm text-[#173c34] outline-none transition placeholder:text-[#89928d] focus:border-[#bd8b3d] focus:ring-2 focus:ring-[#d99d4b]/20"
                                    id="feedback-message"
                                    onChange={(event) => {
                                        feedbackForm.setData('message', event.target.value);
                                        setFeedbackSubmitted(false);
                                    }}
                                    placeholder="Write your feedback here..."
                                    value={feedbackForm.data.message}
                                />
                                {feedbackForm.errors.message && (
                                    <p className="mt-1.5 text-xs text-red-700">
                                        {feedbackForm.errors.message}
                                    </p>
                                )}
                            </div>

                            <div className="text-center">
                                <button
                                    className="inline-flex min-h-11 items-center justify-center rounded-none bg-[#173c34] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#245548] disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={feedbackForm.processing}
                                    type="submit"
                                >
                                    {feedbackForm.processing
                                        ? 'Submitting...'
                                        : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
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
