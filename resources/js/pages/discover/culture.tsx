import { Head, Link } from '@inertiajs/react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

const experiences = [
    {
        title: 'Buyogan Festival',
        category: 'Community celebration',
        location: 'Abuyog, Leyte',
        description:
            'A celebration named in Abuyog’s cultural calendar. Event dates and program details are to be announced through official local channels.',
        image: '/abuyog-5.jpg',
        alt: 'Festival-themed destination image from the existing tourism collection',
    },
    {
        title: 'Local Traditions',
        category: 'Culture & community',
        location: 'Abuyog, Leyte',
        description:
            'Learn about traditions and cultural activities through stories shared by local communities.',
        image: '/abuyog-5.jpg',
        alt: 'Abuyog community image from the existing tourism collection',
    },
    {
        title: 'Local Food',
        category: 'Food & flavor',
        location: 'Abuyog, Leyte',
        description:
            'Discover local flavors and food traditions. Featured dishes can be added as verified details become available.',
        image: '/abuyog-4.jpg',
        alt: 'Local destination image from the existing tourism collection',
    },
    {
        title: 'Arts & Performances',
        category: 'Arts & culture',
        location: 'Abuyog, Leyte',
        description:
            'Find cultural performances, local arts, and creative activities shared by the community.',
        image: '/Abuyog-7.jpg',
        alt: 'Cultural destination image from the existing tourism collection',
    },
];

function PageNavigation() {
    return (
        <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-6 py-6 lg:px-10">
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
                <Link className="transition hover:text-[#e4b866]" href="/">
                    Home
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#discover"
                >
                    Discover
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#heritage"
                >
                    Heritage
                </Link>
                <Link
                    className="transition hover:text-[#e4b866]"
                    href="/#culture"
                >
                    Culture
                </Link>
            </nav>
            <Link
                className="hidden shrink-0 rounded-none bg-white px-4 py-2.5 text-xs font-semibold text-[#173c34] transition hover:bg-[#f6e5bd] sm:inline-flex"
                href="/"
            >
                Back to Discover
            </Link>
            <PublicMobileMenu desktopNavigation />
        </header>
    );
}

export default function Culture() {
    return (
        <>
            <Head title="Culture & Festivals of Abuyog" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <section className="relative flex min-h-[390px] flex-col bg-[#123d36] text-white sm:min-h-[440px]">
                    <img
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        src="/abuyog-5.jpg"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,39,34,.9)_0%,rgba(11,50,43,.58)_55%,rgba(8,36,32,.25)_100%),linear-gradient(0deg,rgba(8,36,32,.72)_0%,transparent_65%)]" />
                    <PageNavigation />
                    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-12 lg:px-10 lg:pb-16">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                            CULTURE &amp; FESTIVAL
                        </p>
                        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-normal sm:text-6xl">
                            Culture &amp; Festivals of Abuyog
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                            Experience local traditions, community celebrations,
                            food, arts, and performances.
                        </p>
                    </div>
                </section>
                <main className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:px-10">
                    <div className="mb-10 max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                            CULTURE IN COMMUNITY
                        </p>
                        <h2 className="mt-3 font-serif text-3xl font-normal text-[#173c34] sm:text-4xl">
                            Stories worth celebrating.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#718078]">
                            Explore sample topics about Buyogan Festival, local
                            traditions, food, arts, and cultural activities.
                            Event schedules and program information will be
                            shared when verified details are available.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {experiences.map((experience) => (
                            <article
                                className="group overflow-hidden rounded-2xl bg-white shadow-[0_12px_35px_rgba(31,54,44,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(31,54,44,.15)]"
                                key={experience.title}
                            >
                                <div className="h-56 overflow-hidden bg-[#e8ede7]">
                                    <img
                                        alt={experience.alt}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                        loading="lazy"
                                        src={experience.image}
                                    />
                                </div>
                                <div className="p-6">
                                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#bd8b3d]">
                                        {experience.category}
                                    </p>
                                    <h3 className="mt-2 font-serif text-2xl text-[#173c34]">
                                        {experience.title}
                                    </h3>
                                    <p className="mt-3 flex items-center gap-2 text-xs text-[#718078]">
                                        ⌖ {experience.location}
                                    </p>
                                    <p className="mt-4 min-h-14 text-sm leading-6 text-[#718078]">
                                        {experience.description}
                                    </p>
                                    <Link
                                        className="mt-5 inline-flex items-center text-xs font-bold tracking-[0.12em] text-[#9b6a28] transition hover:text-[#173c34]"
                                        href="/#culture"
                                    >
                                        VIEW DETAILS{' '}
                                        <span className="ml-2 text-base">
                                            {'\u2197'}
                                        </span>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
                <footer className="border-t border-[#dedfd8] bg-[#f0eadc] px-6 py-8 lg:px-10">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-[#718078]">
                        <span>ABUYOG TOURISM · TOURISM &amp; HERITAGE</span>
                        <Link
                            className="font-semibold text-[#173c34] hover:text-[#9b6a28]"
                            href="/"
                        >
                            ← Back to Discover
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
