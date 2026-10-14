import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

const photos = [
    {
        src: '/images/festivals/buyogan/buyogan-performers.jpg',
        alt: 'Buyogan Festival performers in bee-inspired costumes',
        caption: 'Buyogan Festival performers',
        creator: 'JinJian',
        source: 'https://commons.wikimedia.org/wiki/File:BUYOGAN.JPG',
        license: 'https://creativecommons.org/licenses/by-sa/3.0/',
        licenseName: 'CC BY-SA 3.0',
    },
    {
        src: '/images/festivals/buyogan/buyogan-pintados-2016.jpg',
        alt: 'Buyogan Festival performers representing the festival at a 2016 event in Tacloban',
        caption: 'Buyogan Festival at Pintados-Kasadyaan, 2016',
        creator: 'Cutie Bunny 143',
        source: 'https://commons.wikimedia.org/wiki/File:Buyogan_Festival_in_the_Pintados_Kasadyaan_Festival_2016.jpg',
        license: 'https://creativecommons.org/licenses/by-sa/4.0/',
        licenseName: 'CC BY-SA 4.0',
    },
];

const highlights = [
    {
        title: 'Street dancing',
        description:
            'Festival dancers bring the celebration into public spaces through choreographed movement and pageantry.',
    },
    {
        title: 'Bee-inspired costumes',
        description:
            'The bee motif connects the festival’s name and visual identity with the local word buyog.',
    },
    {
        title: 'Cultural performances',
        description:
            'Performances share Abuyog’s local identity with residents and visitors.',
    },
    {
        title: 'Community participation',
        description:
            'The celebration brings local performers and the wider community together.',
    },
];

export default function BuyoganFestival() {
    const [activePhoto, setActivePhoto] = useState<number | null>(null);
    const photoButtons = useRef<Array<HTMLButtonElement | null>>([]);
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activePhoto === null) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActivePhoto(null);
                requestAnimationFrame(() =>
                    photoButtons.current[activePhoto]?.focus(),
                );

                return;
            }

            if (event.key === 'Tab') {
                const focusableElements =
                    dialogRef.current?.querySelectorAll<HTMLElement>(
                        'button:not([disabled]), a[href]',
                    );
                const firstElement = focusableElements?.[0];
                const lastElement =
                    focusableElements?.[focusableElements.length - 1];

                if (
                    event.shiftKey &&
                    firstElement &&
                    document.activeElement === firstElement
                ) {
                    event.preventDefault();
                    lastElement?.focus();
                } else if (
                    !event.shiftKey &&
                    lastElement &&
                    document.activeElement === lastElement
                ) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activePhoto]);

    const closePhoto = () => {
        if (activePhoto === null) {
            return;
        }

        const photoIndex = activePhoto;
        setActivePhoto(null);
        requestAnimationFrame(() => photoButtons.current[photoIndex]?.focus());
    };

    return (
        <>
            <Head title="Buyogan Festival | Abuyog Tourism" />
            <div className="min-h-screen bg-[#0c352e] text-[#fbf8f0]">
                <section className="relative flex min-h-[560px] flex-col overflow-hidden bg-[#0c352e] sm:min-h-[660px]">
                    <img
                        src={photos[0].src}
                        alt="Buyogan Festival dancers in bee-inspired costumes"
                        fetchPriority="high"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,34,.92)_0%,rgba(11,50,43,.68)_55%,rgba(8,36,32,.40)_100%),linear-gradient(0deg,rgba(8,36,32,.78)_0%,transparent_68%)]" />
                    <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-6 py-6 lg:px-10">
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
                            <Link
                                className="transition hover:text-[#e4b866]"
                                href="/"
                            >
                                Home
                            </Link>
                            <Link
                                className="transition hover:text-[#e4b866]"
                                href="/discover"
                            >
                                Discover
                            </Link>
                            <Link
                                className="transition hover:text-[#e4b866]"
                                href="/resorts"
                            >
                                Resorts
                            </Link>
                            <Link
                                className="transition hover:text-[#e4b866]"
                                href="/travel-guide"
                            >
                                Travel Guide
                            </Link>
                        </nav>
                        <Link
                            className="hidden shrink-0 items-center gap-2 rounded-none bg-white px-4 py-2.5 text-xs font-semibold text-[#173c34] transition hover:bg-[#f6e5bd] sm:inline-flex"
                            href="/discover"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Discover
                        </Link>
                        <PublicMobileMenu desktopNavigation />
                    </header>
                    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-16 lg:px-10 lg:pb-24">
                        <p className="text-xs font-bold tracking-[0.24em] text-[#f0c978]">
                            A CELEBRATION OF IDENTITY
                        </p>
                        <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.04] font-normal sm:text-7xl lg:text-8xl">
                            Experience the
                            <br />
                            <span className="text-[#f0c978]">
                                Buyogan Festival
                            </span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
                            Discover the bee-inspired traditions, performances,
                            and community spirit of Abuyog, Leyte.
                        </p>
                    </div>
                </section>

                <main>
                    <section className="px-6 py-16 sm:py-24 lg:px-10">
                        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                                    ROOTED IN ABUYOG
                                </p>
                                <h2 className="mt-4 font-serif text-4xl leading-tight font-normal sm:text-5xl">
                                    A festival with a bee at its heart.
                                </h2>
                            </div>
                            <div className="space-y-5 text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                                <p>
                                    Buyogan is associated with Abuyog, Leyte,
                                    and takes its name from <em>buyog</em>, the
                                    local word for bee. The bee gives the
                                    festival its distinctive motif, reflected in
                                    its costumes and performances.
                                </p>
                                <p>
                                    More than a colorful celebration, Buyogan
                                    offers a way to experience the town’s
                                    cultural identity through dance, creativity,
                                    and participation by the local community.
                                </p>
                                <a
                                    href="https://tpb.gov.ph/events/buyogan-festival/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 font-semibold text-[#f0c978] underline decoration-[#f0c978]/45 underline-offset-4 transition hover:text-white"
                                >
                                    Tourism Promotions Board: Buyogan Festival
                                    <span aria-hidden="true">{'\u2197'}</span>
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-white/10 bg-[#123d36] px-6 py-16 sm:py-20 lg:px-10">
                        <div className="mx-auto max-w-7xl">
                            <div className="max-w-2xl">
                                <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                                    FESTIVAL HIGHLIGHTS
                                </p>
                                <h2 className="mt-4 font-serif text-3xl font-normal sm:text-4xl">
                                    Color, movement, and community.
                                </h2>
                            </div>
                            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {highlights.map((highlight, index) => (
                                    <article
                                        key={highlight.title}
                                        className="rounded-2xl border border-white/10 bg-[#0c352e]/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-[#e4b866]/50"
                                    >
                                        <span className="font-serif text-3xl text-[#e4b866]">
                                            0{index + 1}
                                        </span>
                                        <h3 className="mt-5 font-serif text-xl text-white">
                                            {highlight.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-white/65">
                                            {highlight.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="px-6 py-16 sm:py-24 lg:px-10">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                                        MOMENTS FROM THE FESTIVAL
                                    </p>
                                    <h2 className="mt-4 font-serif text-3xl font-normal sm:text-4xl">
                                        Buyogan in photographs
                                    </h2>
                                </div>
                                <p className="max-w-lg text-sm leading-6 text-white/60">
                                    Select a photograph to view it larger.
                                    Images are credited to their contributors
                                    and shared under the licenses shown.
                                </p>
                            </div>
                            <div className="mt-9 grid gap-6 md:grid-cols-2">
                                {photos.map((photo, index) => (
                                    <figure
                                        key={photo.src}
                                        className="overflow-hidden rounded-2xl border border-white/10 bg-[#123d36]"
                                    >
                                        <button
                                            ref={(element) => {
                                                photoButtons.current[index] =
                                                    element;
                                            }}
                                            type="button"
                                            aria-label={`Enlarge photo: ${photo.alt}`}
                                            onClick={() =>
                                                setActivePhoto(index)
                                            }
                                            className="group relative block aspect-[4/3] w-full overflow-hidden bg-[#173c34] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#f0c978]"
                                        >
                                            <img
                                                src={photo.src}
                                                alt={photo.alt}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                            />
                                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 text-left text-sm font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                                View larger
                                            </span>
                                        </button>
                                        <figcaption className="flex flex-col gap-2 p-5 text-xs leading-5 text-white/65 sm:flex-row sm:items-center sm:justify-between">
                                            <span>
                                                <strong className="block text-sm text-white">
                                                    {photo.caption}
                                                </strong>
                                                Photo by {photo.creator}
                                            </span>
                                            <span className="flex shrink-0 gap-3">
                                                <a
                                                    href={photo.source}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline decoration-white/30 underline-offset-4 hover:text-[#f0c978]"
                                                >
                                                    Source
                                                </a>
                                                <a
                                                    href={photo.license}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline decoration-white/30 underline-offset-4 hover:text-[#f0c978]"
                                                >
                                                    {photo.licenseName}
                                                </a>
                                            </span>
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-white/10 bg-[#123d36] px-6 py-16 sm:py-20 lg:px-10">
                        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                                    PLAN WITH VERIFIED DETAILS
                                </p>
                                <h2 className="mt-4 font-serif text-3xl font-normal sm:text-4xl">
                                    Festival information
                                </h2>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <article className="rounded-2xl border border-white/10 bg-[#0c352e]/70 p-6">
                                    <MapPin className="h-5 w-5 text-[#f0c978]" />
                                    <h3 className="mt-4 font-serif text-xl">
                                        Location
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        Abuyog, Leyte, Philippines
                                    </p>
                                </article>
                                <article className="rounded-2xl border border-white/10 bg-[#0c352e]/70 p-6">
                                    <CalendarDays className="h-5 w-5 text-[#f0c978]" />
                                    <h3 className="mt-4 font-serif text-xl">
                                        Schedule
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        No current festival date or program time
                                        is confirmed here. Check official
                                        announcements before making plans.
                                    </p>
                                </article>
                                <div className="sm:col-span-2">
                                    <p className="text-xs leading-5 text-white/50">
                                        For current festival news, consult the{' '}
                                        <a
                                            href="https://pia.gov.ph/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#f0c978] underline underline-offset-4 hover:text-white"
                                        >
                                            Philippine Information Agency
                                        </a>{' '}
                                        and local official announcements.
                                        Background details are linked to the{' '}
                                        <a
                                            href="https://tpb.gov.ph/events/buyogan-festival/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[#f0c978] underline underline-offset-4 hover:text-white"
                                        >
                                            Tourism Promotions Board
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-white/10 px-6 py-8 lg:px-10">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-white/55">
                        <span>ABUYOG TOURISM · TOURISM &amp; HERITAGE</span>
                        <Link
                            className="font-semibold text-[#f0c978] transition hover:text-white"
                            href="/discover"
                        >
                            <span aria-hidden="true">{'\u2190'} </span>
                            Back to Discover
                        </Link>
                    </div>
                </footer>
            </div>

            {activePhoto !== null && (
                <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Enlarged photograph: ${photos[activePhoto].alt}`}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closePhoto();
                        }
                    }}
                >
                    <button
                        type="button"
                        autoFocus
                        onClick={closePhoto}
                        aria-label="Close enlarged photograph"
                        className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0c978]"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <figure className="max-h-full max-w-6xl">
                        <img
                            src={photos[activePhoto].src}
                            alt={photos[activePhoto].alt}
                            className="max-h-[78vh] max-w-full rounded-lg object-contain"
                        />
                        <figcaption className="mt-3 text-center text-sm text-white/75">
                            {photos[activePhoto].caption} · Photo by{' '}
                            {photos[activePhoto].creator} ·{' '}
                            <a
                                href={photos[activePhoto].source}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4 hover:text-[#f0c978]"
                            >
                                Source
                            </a>
                            {' · '}
                            <a
                                href={photos[activePhoto].license}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4 hover:text-[#f0c978]"
                            >
                                {photos[activePhoto].licenseName}
                            </a>
                        </figcaption>
                    </figure>
                </div>
            )}
        </>
    );
}
