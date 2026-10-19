import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import PortalLogo from '../../components/PortalLogo';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type BookImage = {
    src: string;
    alt: string;
    caption: string;
    credit: string;
    creditUrl?: string;
};

type BookPage = {
    label: string;
    title: string;
    subtitle?: string;
    paragraphs: string[];
    image?: BookImage;
};

const references = [
    {
        label: 'Abuyog historical account',
        href: 'https://sites.google.com/view/abuyog-integrated-management-s/about-us/history',
    },
    {
        label: 'St. Francis Xavier Church background',
        href: 'https://www.theoldchurches.com/philippines/leyte/abuyog/st-francis-xavier-church-abuyog/',
    },
    {
        label: 'Buyogan Festival — Tourism Promotions Board',
        href: 'https://tpb.gov.ph/events/buyogan-festival/',
    },
    {
        label: 'Buyogan Festival — Leyte provincial coverage',
        href: 'https://leyteprovince.gov.ph/2024/07/02/2024-pintados-kasadyaan-festival-of-festivals-buyogan-festival-grabbed-the-top-prize/',
    },
    {
        label: 'Bee photograph — Wikimedia Commons',
        href: 'https://commons.wikimedia.org/wiki/File:European_honey_bee_extracts_nectar.jpg',
    },
    {
        label: 'Boxer Codex illustration — Wikimedia Commons',
        href: 'https://commons.wikimedia.org/wiki/File:Visayans_1.png',
    },
    {
        label: 'Spanish galleon model — Wikimedia Commons',
        href: 'https://commons.wikimedia.org/wiki/File:Galleon-spanish.jpg',
    },
    {
        label: 'Jesuit missionary artwork — Wikimedia Commons',
        href: 'https://commons.wikimedia.org/wiki/File:Andrea_Pozzo_-_Allegory_of_the_Jesuits%27_Missionary_Work_-_WGA18353.jpg',
    },
];

const bookPages: BookPage[] = [
    {
        label: 'The cover',
        title: 'ABUYOG',
        subtitle: 'A Story of History, Heritage, and Culture',
        paragraphs: [
            "Discover the story of Abuyog, Leyte—a historic town whose name, traditions, and cultural celebrations reflect its rich local identity. From the legend of the bee to the milestones that shaped its early history, explore the stories that connect Abuyog's past with its living heritage today.",
        ],
        image: {
            src: '/history/honey-bee-on-aster.jpg',
            alt: 'European honey bee collecting nectar from an Aster flower',
            caption: 'A European honey bee gathering nectar from an Aster flower.',
            credit: 'Photo: John Severns · Public domain',
            creditUrl:
                'https://commons.wikimedia.org/wiki/File:European_honey_bee_extracts_nectar.jpg',
        },
    },
    {
        label: 'The name',
        title: 'The Story Behind Abuyog',
        paragraphs: [
            "According to local tradition, Spanish sailors came ashore near the mouth of the Abuyog River to replenish their supplies. While exploring the area, they noticed swarms of bees. Curious about the insects, they asked the local people what they were called. The locals answered, ‘Buyog,’ the Visayan word for bee.",
            "The sailors repeated the word, saying, ‘Ah, Buyog!’ Over time, the place became known as Abuyog. This familiar story remains a meaningful part of the town's identity, connecting its name with the natural environment and traditions of its people.",
            "Although the story is remembered as a local legend rather than a fully verified historical account, it continues to be shared as an explanation of Abuyog's name.",
        ],
        image: {
            src: '/history/honey-bee-on-aster.jpg',
            alt: 'Honey bee on a flower, illustrating the town name-origin legend',
            caption:
                'The bee, or ‘buyog,’ is central to the town’s popular name-origin legend.',
            credit: 'Photo: John Severns · Public domain',
            creditUrl:
                'https://commons.wikimedia.org/wiki/File:European_honey_bee_extracts_nectar.jpg',
        },
    },
    {
        label: 'Through time',
        title: 'A Town with a Long History',
        paragraphs: [
            'Abuyog is one of the historic communities of Leyte. Its early history includes accounts of local conflict, maritime raids, missionary activity, and the development of the town and parish.',
            "These milestones help explain how Abuyog's community developed through different periods. They also connect the town's historical past with its religious heritage and cultural identity today.",
            "The following pages explore important dates associated with Abuyog's early history. Historical details are presented according to available references, while illustrations are used only to provide visual context.",
        ],
        image: {
            src: '/history/visayans-leyte-boxer-codex.png',
            alt: 'Illustration of Visayan people from the Boxer Codex, dated 1595',
            caption:
                'Historical artwork illustrating aspects of early Philippine society; it does not specifically depict Abuyog.',
            credit: 'Artist: Boxer Codex · Public domain',
            creditUrl: 'https://commons.wikimedia.org/wiki/File:Visayans_1.png',
        },
    },
    {
        label: '1588',
        title: 'The Local Revolt of 1588',
        paragraphs: [
            'Historical accounts of Abuyog report that a local revolt occurred in 1588 during the early Spanish colonial period. This event is remembered as one of the significant milestones in the town’s early history.',
            'The period brought major changes to local communities, including new colonial authorities and social conditions. The reported revolt forms part of the historical record used to understand Abuyog’s early experiences.',
            'Specific details about the revolt should be included only when supported by a reliable historical source.',
        ],
        image: {
            src: '/history/visayans-leyte-boxer-codex.png',
            alt: 'Boxer Codex illustration of Visayan people from Leyte or Samar',
            caption:
                'Illustrative artwork representing the period; this is not a confirmed depiction of the 1588 revolt in Abuyog.',
            credit: 'Artist: Boxer Codex · Public domain',
            creditUrl: 'https://commons.wikimedia.org/wiki/File:Visayans_1.png',
        },
    },
    {
        label: '1613',
        title: 'The Raids of 1613',
        paragraphs: [
            'Historical accounts report that Abuyog was raided and plundered by groups identified as Sanguiles and Caragas in 1613. This event represents another difficult chapter in the town’s early history.',
            'The reported raids form part of the story of communities living in coastal areas during a period of regional movement and conflict. They are remembered as an important milestone in Abuyog’s historical timeline.',
            'The account should be presented using the details supported by historical references, without adding invented descriptions of the attack or its consequences.',
        ],
        image: {
            src: '/history/spanish-galleon-model.jpg',
            alt: 'Wooden Spanish galleon model at the Naval History Museum in Venice',
            caption:
                'A Spanish galleon model used as period context, not a verified image of the 1613 raid.',
            credit: 'Photo: Thyes · CC BY-SA 3.0',
            creditUrl: 'https://commons.wikimedia.org/wiki/File:Galleon-spanish.jpg',
        },
    },
    {
        label: '1655',
        title: 'The Jesuit Mission of 1655',
        paragraphs: [
            'Historical references identify 1655 as an important year in Abuyog’s religious history, when Jesuit missionaries established a mission in the area.',
            'Missionary activity formed part of the wider development of religious communities during the Spanish colonial period. This milestone helps explain the historical connection between Abuyog’s early community and its religious heritage.',
            'The mission is an important part of the timeline leading toward the later establishment of the town and parish.',
        ],
        image: {
            src: '/history/jesuit-mission-art.jpg',
            alt: 'Andrea Pozzo’s allegorical painting of Jesuit missionary work, 1691–1694',
            caption:
                'Artwork representing Jesuit missionary activity; it does not depict the Abuyog mission.',
            credit: 'Artist: Andrea Pozzo · Public domain · Web Gallery of Art',
            creditUrl:
                'https://commons.wikimedia.org/wiki/File:Andrea_Pozzo_-_Allegory_of_the_Jesuits%27_Missionary_Work_-_WGA18353.jpg',
        },
    },
    {
        label: '1716',
        title: 'The Founding of Abuyog in 1716',
        paragraphs: [
            'Historical references identify 1716 as the year Abuyog was formally established as a town and parish under the patronage of St. Francis Xavier.',
            'This milestone represents an important stage in the development of the local community and its religious institutions. The parish and its patron saint remain part of the town’s heritage and historical identity.',
            'The founding date provides a connection between Abuyog’s early history and the community that visitors can experience today.',
        ],
        image: {
            src: '/history/st-francis-xavier-parish.jpg',
            alt: 'Present-day facade of St. Francis Xavier Parish Church in Abuyog, Leyte',
            caption:
                'St. Francis Xavier Parish Church in Abuyog, photographed in 2016.',
            credit: 'Photo: JinJian · CC BY-SA 4.0',
            creditUrl:
                'https://commons.wikimedia.org/wiki/File:St._Francis_Xavier_Parish_at_Abuyog.jpg',
        },
    },
    {
        label: 'Buyogan Festival',
        title: 'Buyogan Festival: The Bee That Represents Abuyog',
        paragraphs: [
            'The Buyogan Festival celebrates an important symbol of Abuyog’s identity: the bee. Inspired by the Visayan word ‘buyog,’ the festival connects the town’s name-origin legend with its cultural traditions.',
            'Through bee-inspired costumes, dance performances, and community participation, the festival brings local heritage to life. The celebrations allow residents and visitors to experience Abuyog’s cultural identity through music, movement, creativity, and shared community pride.',
            'The festival represents the connection between a story remembered from the past and a cultural tradition celebrated in the present.',
        ],
        image: {
            src: '/images/festivals/buyogan/buyogan-performers.jpg',
            alt: 'Buyogan Festival performers wearing bee-inspired costumes',
            caption:
                'Buyogan Festival celebrates Abuyog’s bee-inspired identity through cultural performances.',
            credit:
                'Existing portal image; photographer and reuse license were not recorded with the asset.',
        },
    },
    {
        label: 'Living heritage',
        title: 'The Past Lives On',
        paragraphs: [
            'Abuyog’s history is not limited to dates and historical accounts. It continues through its people, local traditions, heritage places, and cultural celebrations.',
            'The story of the bee remains a recognizable part of the town’s identity. Its historical milestones provide context for understanding the community’s development, while the Buyogan Festival expresses local pride through a living cultural tradition.',
            'By learning about Abuyog’s past, visitors can better appreciate the heritage that continues to shape the town today.',
        ],
        image: {
            src: '/images/festivals/buyogan/buyogan-pintados-2016.jpg',
            alt: 'Buyogan Festival dancers in golden bee-inspired costumes',
            caption:
                'A Buyogan cultural performance from the existing portal image collection.',
            credit:
                'Existing portal image; photographer and reuse license were not recorded with the asset.',
        },
    },
    {
        label: 'References',
        title: 'References and Further Reading',
        paragraphs: [
            'This digital history book brings together historical accounts, local traditions, heritage photographs, and cultural references to introduce visitors to Abuyog, Leyte. The origin story of the town’s name is presented as a local legend, while historical dates are included according to the available references.',
        ],
    },
];

function PageNavigation() {
    return (
        <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between gap-5 px-6 py-6 lg:px-10">
            <Link href="/" className="flex items-center gap-3">
                <PortalLogo />
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
                Back to Home
            </Link>
            <PublicMobileMenu desktopNavigation />
        </header>
    );
}

function BookPageContent({
    page,
    pageNumber,
}: {
    page: BookPage;
    pageNumber: number;
}) {
    const isCover = pageNumber === 1;
    const isReferences = pageNumber === bookPages.length;

    return (
        <article
            aria-label={`Page ${pageNumber}: ${page.title}`}
            className={`history-book__page ${isCover ? 'history-book__page--cover' : ''}`}
            key={pageNumber}
        >
            <div className="history-book__page-content">
                <div className="history-book__page-heading">
                    <p className="history-book__eyebrow">{page.label}</p>
                    <h2 className={isCover ? 'history-book__cover-title' : ''}>
                        {page.title}
                    </h2>
                    {page.subtitle && (
                        <p className="history-book__subtitle">{page.subtitle}</p>
                    )}
                </div>

                {isCover && (
                    <div className="history-book__cover-logo">
                        <PortalLogo className="h-14 w-14 object-contain" />
                        <span>ABUYOG · LEYTE</span>
                    </div>
                )}

                <div className="history-book__body">
                    {page.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}

                    {page.image && (
                        <figure className="history-book__figure">
                            <img
                                alt={page.image.alt}
                                className="history-book__image"
                                loading={pageNumber <= 2 ? 'eager' : 'lazy'}
                                src={page.image.src}
                            />
                            <figcaption>
                                <span>{page.image.caption}</span>
                                {page.image.creditUrl ? (
                                    <a
                                        href={page.image.creditUrl}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        {page.image.credit}
                                    </a>
                                ) : (
                                    <span>{page.image.credit}</span>
                                )}
                            </figcaption>
                        </figure>
                    )}

                    {isReferences && (
                        <>
                            <h3 className="history-book__section-title">
                                Sources
                            </h3>
                            <ol className="history-book__references">
                                {references.map((reference) => (
                                    <li key={reference.href}>
                                        <a
                                            href={reference.href}
                                            rel="noreferrer"
                                            target="_blank"
                                        >
                                            {reference.label}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                            <h3 className="history-book__section-title">
                                Image credits and licenses
                            </h3>
                            <ul className="history-book__credits">
                                <li>
                                    Bee photograph — John Severns, public domain;
                                    Boxer Codex illustration — Boxer Codex,
                                    public domain.
                                </li>
                                <li>
                                    Spanish galleon model — Thyes, CC BY-SA 3.0;
                                    Jesuit missionary artwork — Andrea Pozzo,
                                    public domain.
                                </li>
                                <li>
                                    St. Francis Xavier Parish — JinJian, CC BY-SA
                                    4.0. Follow each linked source for its
                                    license terms.
                                </li>
                                <li>
                                    Buyogan festival photographs are existing
                                    portal assets. Their original photographer
                                    and reuse license were not recorded with the
                                    files; verify these details before
                                    redistributing the photographs.
                                </li>
                            </ul>
                        </>
                    )}
                </div>
            </div>
            <footer className="history-book__page-number">
                <span>ABUYOG · HISTORY &amp; HERITAGE</span>
                <span>{pageNumber}</span>
            </footer>
        </article>
    );
}

export default function Heritage() {
    const [activePage, setActivePage] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const updateViewport = () => {
            setIsMobile(mediaQuery.matches);
            if (!mediaQuery.matches) {
                setActivePage((page) => page - (page % 2));
            }
        };

        updateViewport();
        mediaQuery.addEventListener('change', updateViewport);

        return () => {
            mediaQuery.removeEventListener('change', updateViewport);
        };
    }, []);

    const lastPage = isMobile ? bookPages.length - 1 : bookPages.length - 2;
    const pageStep = isMobile ? 1 : 2;
    const visiblePages = isMobile
        ? [activePage]
        : [activePage, activePage + 1].filter(
              (pageNumber) => pageNumber < bookPages.length,
          );
    const firstVisiblePage = activePage + 1;
    const lastVisiblePage = visiblePages[visiblePages.length - 1] + 1;

    return (
        <>
            <Head title="History & Heritage of Abuyog" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <section className="relative flex min-h-[220px] flex-col bg-[#123d36] text-white sm:min-h-[270px]">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(228,184,102,.18),transparent_45%)]" />
                    <PageNavigation />
                    <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 lg:px-10">
                        <p className="text-xs font-bold tracking-[0.22em] text-[#e4b866]">
                            HISTORY &amp; HERITAGE
                        </p>
                        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight font-normal sm:text-5xl">
                            The story of Abuyog, page by page.
                        </h1>
                    </div>
                </section>

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#53645d]">
                            <p className="font-semibold text-[#173c34]">
                                A digital history book
                            </p>
                            <p aria-live="polite" className="tabular-nums">
                                {isMobile
                                    ? `Page ${firstVisiblePage} of ${bookPages.length}`
                                    : `Pages ${firstVisiblePage}–${lastVisiblePage} of ${bookPages.length}`}
                            </p>
                        </div>

                        <div className="history-book__frame">
                            <div className="history-book__spread">
                                {visiblePages.map((pageNumber) => (
                                    <BookPageContent
                                        key={pageNumber}
                                        page={bookPages[pageNumber]}
                                        pageNumber={pageNumber + 1}
                                    />
                                ))}
                            </div>
                            <span
                                aria-hidden="true"
                                className="history-book__spine"
                            />
                        </div>

                        <nav
                            aria-label="History book pages"
                            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                        >
                            <button
                                aria-label="Go to first page"
                                className="history-book__control"
                                disabled={activePage === 0}
                                onClick={() => setActivePage(0)}
                                type="button"
                            >
                                <ChevronsLeft aria-hidden="true" size={18} />
                                <span className="sr-only">First page</span>
                            </button>
                            <button
                                aria-label="Previous page"
                                className="history-book__control"
                                disabled={activePage === 0}
                                onClick={() =>
                                    setActivePage((page) =>
                                        Math.max(0, page - pageStep),
                                    )
                                }
                                type="button"
                            >
                                <ChevronLeft aria-hidden="true" size={18} />
                                <span>Previous</span>
                            </button>
                            <span
                                aria-live="polite"
                                className="min-w-28 px-2 text-center text-xs font-semibold tracking-wide text-[#53645d]"
                            >
                                {isMobile
                                    ? `${firstVisiblePage} / ${bookPages.length}`
                                    : `${firstVisiblePage}–${lastVisiblePage} / ${bookPages.length}`}
                            </span>
                            <button
                                aria-label="Next page"
                                className="history-book__control"
                                disabled={activePage >= lastPage}
                                onClick={() =>
                                    setActivePage((page) =>
                                        Math.min(lastPage, page + pageStep),
                                    )
                                }
                                type="button"
                            >
                                <span>Next</span>
                                <ChevronRight aria-hidden="true" size={18} />
                            </button>
                            <button
                                aria-label="Go to last page"
                                className="history-book__control"
                                disabled={activePage >= lastPage}
                                onClick={() => setActivePage(lastPage)}
                                type="button"
                            >
                                <ChevronsRight aria-hidden="true" size={18} />
                                <span className="sr-only">Last page</span>
                            </button>
                        </nav>

                        <p className="mt-5 text-center text-xs leading-6 text-[#718078]">
                            Historical illustrations provide context and are
                            not presented as verified depictions of specific
                            events in Abuyog.
                        </p>
                    </div>
                </main>

                <footer className="border-t border-[#dedfd8] bg-[#f0eadc] px-6 py-8 lg:px-10">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-xs text-[#718078]">
                        <span>ABUYOG TOURISM · TOURISM &amp; HERITAGE</span>
                        <Link
                            className="font-semibold text-[#173c34] hover:text-[#9b6a28]"
                            href="/"
                        >
                            Back to Home
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
