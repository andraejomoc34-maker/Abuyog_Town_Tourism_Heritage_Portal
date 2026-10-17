import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, Phone, UserRound } from 'lucide-react';
import PublicMobileMenu from '../../components/PublicMobileMenu';

type EventRecord = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    description: string;
    category: 'Event' | 'Festival';
    imageUrl: string | null;
    images: { url: string }[];
    startDate: string;
    endDate: string;
    startTime: string | null;
    venue: string | null;
    organizer: string | null;
    contactInformation: string | null;
    sourceUrl: string | null;
    dateStatus: 'Confirmed' | 'Tentative' | 'Unverified';
};

type EventStatus = 'Upcoming' | 'Ongoing' | 'Past';
type CalendarView = 'Month' | 'Week' | 'List';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const statusFilters = ['All', 'Upcoming', 'Ongoing', 'Past'] as const;
const categoryFilters = ['All', 'Festival', 'Event'] as const;

function parseLocalDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day);
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }): string {
    return new Intl.DateTimeFormat('en-PH', options).format(date);
}

function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfWeek(date: Date): Date {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    start.setDate(start.getDate() - start.getDay());

    return start;
}

function getEventStatus(event: EventRecord, today: string): EventStatus {
    if (event.endDate < today) {
        return 'Past';
    }

    if (event.startDate > today) {
        return 'Upcoming';
    }

    return 'Ongoing';
}

function compareEvents(first: EventRecord, second: EventRecord): number {
    return first.startDate.localeCompare(second.startDate)
        || (first.startTime ?? '').localeCompare(second.startTime ?? '')
        || first.title.localeCompare(second.title);
}

function statusColor(status: EventStatus): string {
    if (status === 'Ongoing') {
        return 'bg-[#e8f2e8] text-[#245548]';
    }

    return status === 'Past'
        ? 'bg-[#efede8] text-[#68766f]'
        : 'bg-[#fff3d9] text-[#72531f]';
}

function confirmationColor(status: EventRecord['dateStatus']): string {
    return status === 'Confirmed'
        ? 'bg-[#e8f2e8] text-[#245548]'
        : status === 'Tentative'
          ? 'bg-[#fff3d9] text-[#72531f]'
          : 'bg-[#efede8] text-[#68766f]';
}

export default function EventsCalendar({
    events,
    today,
}: {
    events: EventRecord[];
    today: string;
}) {
    const [view, setView] = useState<CalendarView>('Month');
    const [visibleDate, setVisibleDate] = useState(() => parseLocalDate(today));
    const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All');
    const [categoryFilter, setCategoryFilter] = useState<(typeof categoryFilters)[number]>('All');
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

    const filteredEvents = useMemo(
        () => events.filter((event) => {
            const statusMatches = statusFilter === 'All' || getEventStatus(event, today) === statusFilter;
            const categoryMatches = categoryFilter === 'All' || event.category === categoryFilter;

            return statusMatches && categoryMatches;
        }),
        [events, statusFilter, categoryFilter, today],
    );
    const upcomingEvents = filteredEvents
        .filter((event) => getEventStatus(event, today) !== 'Past')
        .sort(compareEvents);
    const pastEvents = filteredEvents
        .filter((event) => getEventStatus(event, today) === 'Past')
        .sort((first, second) => compareEvents(second, first));
    const selectedEvent = filteredEvents.find((event) => event.id === selectedEventId) ?? null;
    const calendarDates = useMemo(() => {
        if (view === 'Week') {
            const first = startOfWeek(visibleDate);

            return Array.from({ length: 7 }, (_, index) => {
                const date = new Date(first);
                date.setDate(first.getDate() + index);

                return date;
            });
        }

        const firstOfMonth = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
        const dayCount = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0).getDate();
        const cellCount = Math.ceil((firstOfMonth.getDay() + dayCount) / 7) * 7;

        return Array.from({ length: cellCount }, (_, index) => {
            const date = new Date(firstOfMonth);
            date.setDate(index - firstOfMonth.getDay() + 1);

            return date;
        });
    }, [visibleDate, view]);
    const monthTitle = formatDate(visibleDate, { month: 'long', year: 'numeric' });
    const weekEnd = new Date(startOfWeek(visibleDate));
    weekEnd.setDate(weekEnd.getDate() + 6);
    const calendarTitle = view === 'Week'
        ? `${formatDate(startOfWeek(visibleDate), { month: 'short', day: 'numeric' })} – ${formatDate(weekEnd, { month: 'short', day: 'numeric', year: 'numeric' })}`
        : monthTitle;

    function navigateCalendar(direction: -1 | 1): void {
        setVisibleDate((current) => {
            const next = new Date(current);

            if (view === 'Week') {
                next.setDate(next.getDate() + direction * 7);
            } else {
                next.setDate(1);
                next.setMonth(next.getMonth() + direction);
            }

            return next;
        });
    }

    function eventOccursOnDate(event: EventRecord, date: Date): boolean {
        const key = toDateKey(date);

        return event.startDate <= key && event.endDate >= key;
    }

    const visibleEvents = (date: Date) =>
        filteredEvents.filter((event) => eventOccursOnDate(event, date)).sort(compareEvents);
    const listMonthStart = toDateKey(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
    const listMonthEnd = toDateKey(new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0));
    const eventsInMonth = filteredEvents.filter((event) => event.startDate <= listMonthEnd && event.endDate >= listMonthStart);
    const listMonthEvents = [
        ...eventsInMonth.filter((event) => getEventStatus(event, today) !== 'Past').sort(compareEvents),
        ...eventsInMonth
            .filter((event) => getEventStatus(event, today) === 'Past')
            .sort((first, second) => compareEvents(second, first)),
    ];
    const hasCalendarEvents = view === 'Week'
        ? calendarDates.some((date) => visibleEvents(date).length > 0)
        : listMonthEvents.length > 0;

    return (
        <>
            <Head title="Events & Festivals Calendar" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <header className="border-b border-white/10 bg-[#123d36] text-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e4b866] text-xl text-[#e4b866]">✦</span>
                            <span>
                                <strong className="block text-sm tracking-[0.24em]">ABUYOG TOURISM</strong>
                                <small className="mt-1 block text-[10px] tracking-[0.2em] text-white/65">TOURISM &amp; HERITAGE</small>
                            </span>
                        </Link>
                        <Link href="/" className="hidden items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-semibold transition hover:border-[#e4b866] hover:text-[#f6e5bd] sm:inline-flex">
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Back to Home
                        </Link>
                        <PublicMobileMenu />
                    </div>
                </header>

                <section
                    className="bg-[#123d36] bg-cover bg-center px-5 py-12 text-white sm:px-8 sm:py-16"
                    style={{
                        backgroundImage: "linear-gradient(rgba(18, 61, 54, 0.78), rgba(18, 61, 54, 0.84)), url('/abuyog-8.jpg')",
                    }}
                >
                    <div className="mx-auto max-w-7xl">
                        <p className="text-xs font-bold tracking-[0.24em] text-[#e4b866]">LOCAL TRADITIONS &amp; CELEBRATIONS</p>
                        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Celebrate the Culture of Abuyog!</h1>
                        <p className="mt-5 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                            Discover upcoming festivals, cultural celebrations, community activities, and memorable events that bring Abuyog, Leyte, to life. Explore the calendar and be part of our local traditions.
                        </p>
                    </div>
                </section>

                <main className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-10">
                    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] text-[#9b6a28]">ABUYOG, LEYTE · PHILIPPINE TIME</p>
                            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Events &amp; Festivals Calendar</h2>
                            <p className="mt-2 text-sm text-[#68766f]">
                                {events.length} published {events.length === 1 ? 'event has' : 'events have'} a recorded event date.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <label className="text-sm font-semibold">
                                <span className="sr-only">Filter events by status</span>
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statusFilters)[number])} className="min-h-11 rounded-lg border border-[#d7d2c5] bg-white px-3 text-[#173c34] focus:border-[#bd8b3d] focus:outline-none focus:ring-2 focus:ring-[#bd8b3d]/20">
                                    {statusFilters.map((status) => <option key={status}>{status}</option>)}
                                </select>
                            </label>
                            <label className="text-sm font-semibold">
                                <span className="sr-only">Filter events by category</span>
                                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as (typeof categoryFilters)[number])} className="min-h-11 rounded-lg border border-[#d7d2c5] bg-white px-3 text-[#173c34] focus:border-[#bd8b3d] focus:outline-none focus:ring-2 focus:ring-[#bd8b3d]/20">
                                    {categoryFilters.map((category) => <option key={category}>{category}</option>)}
                                </select>
                            </label>
                        </div>
                    </div>

                    <section aria-label="Events calendar" className="overflow-hidden rounded-2xl border border-[#e3ddcf] bg-white shadow-[0_16px_36px_rgba(23,60,52,.07)]">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9e3d5] bg-[#f8f3e8] p-4 sm:px-5">
                            <div className="flex items-center gap-2">
                                <button type="button" aria-label="Previous month or week" onClick={() => navigateCalendar(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d2c5] bg-white hover:border-[#bd8b3d] focus-visible:outline-2 focus-visible:outline-[#bd8b3d]">
                                    <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                                </button>
                                <button type="button" aria-label="Next month or week" onClick={() => navigateCalendar(1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7d2c5] bg-white hover:border-[#bd8b3d] focus-visible:outline-2 focus-visible:outline-[#bd8b3d]">
                                    <ChevronRight aria-hidden="true" className="h-5 w-5" />
                                </button>
                                <h3 className="ml-2 min-w-0 font-serif text-xl sm:text-2xl">{calendarTitle}</h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button type="button" onClick={() => setVisibleDate(parseLocalDate(today))} className="min-h-10 rounded-lg border border-[#d7d2c5] bg-white px-3 text-sm font-semibold hover:border-[#bd8b3d]">Today</button>
                                <div role="group" aria-label="Calendar view" className="flex rounded-lg border border-[#d7d2c5] bg-white p-1">
                                    {(['Month', 'Week', 'List'] as const).map((option) => (
                                        <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)} className={`min-h-8 rounded-md px-3 text-sm font-semibold transition ${view === option ? 'bg-[#173c34] text-white' : 'text-[#53645d] hover:bg-[#f4f1e8]'}`}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {view !== 'List' ? (
                            <div className="grid grid-cols-7">
                                {weekdays.map((weekday) => (
                                    <div key={weekday} className="border-b border-[#e9e3d5] bg-[#fffdf8] px-1 py-2 text-center text-xs font-bold text-[#68766f] sm:py-3 sm:text-sm">
                                        <span className="sm:hidden">{weekday.slice(0, 1)}</span>
                                        <span className="hidden sm:inline">{weekday}</span>
                                    </div>
                                ))}
                                {calendarDates.map((date) => {
                                    const dateKey = toDateKey(date);
                                    const dateEvents = visibleEvents(date);
                                    const inDisplayedMonth = date.getMonth() === visibleDate.getMonth();

                                    return (
                                        <div key={dateKey} aria-label={`${formatDate(date)}${dateKey === today ? ', today' : ''}`} className={`min-h-24 border-b border-r border-[#eee7da] p-1.5 sm:min-h-32 sm:p-2 ${inDisplayedMonth || view === 'Week' ? 'bg-white' : 'bg-[#fbfaf6] text-[#a4aaa5]'}`}>
                                            <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-semibold sm:h-8 sm:min-w-8 sm:text-sm ${dateKey === today ? 'bg-[#173c34] text-white ring-2 ring-[#e4b866]' : ''}`}>
                                                {date.getDate()}
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {dateEvents.slice(0, 3).map((event) => (
                                                    <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)} aria-pressed={selectedEventId === event.id} title={`${event.title} · ${event.category} · ${event.dateStatus} date`} className={`block w-full truncate rounded px-1.5 py-1 text-left text-[10px] font-semibold leading-tight sm:text-xs ${event.category === 'Festival' ? 'bg-[#f8ebce] text-[#684b18]' : 'bg-[#e6efe8] text-[#245548]'} ${selectedEventId === event.id ? 'ring-2 ring-[#173c34]' : ''}`}>
                                                        <span className="hidden sm:inline">{event.title}</span>
                                                        <span className="sm:hidden">{event.title.slice(0, 11)}</span>
                                                    </button>
                                                ))}
                                                {dateEvents.length > 3 && <p className="px-1 text-[10px] text-[#68766f]">+{dateEvents.length - 3} more</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="divide-y divide-[#eee7da]">
                                {listMonthEvents.map((event) => (
                                    <button key={event.id} type="button" onClick={() => setSelectedEventId(event.id)} aria-pressed={selectedEventId === event.id} className={`flex w-full flex-col gap-2 px-4 py-4 text-left transition hover:bg-[#fffdf8] sm:flex-row sm:items-center sm:gap-5 sm:px-6 ${selectedEventId === event.id ? 'bg-[#f8f3e8]' : 'bg-white'}`}>
                                        <span className="min-w-40 text-sm font-semibold text-[#53645d]">
                                            {formatDate(parseLocalDate(event.startDate), { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {event.endDate !== event.startDate && <> – {formatDate(parseLocalDate(event.endDate), { month: 'short', day: 'numeric', year: 'numeric' })}</>}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block font-semibold">{event.title}</span>
                                            <span className="mt-1 block text-sm text-[#68766f]">{event.category}{event.venue ? ` · ${event.venue}` : ''}</span>
                                        </span>
                                        <span className="flex flex-wrap gap-2">
                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${confirmationColor(event.dateStatus)}`}>{event.dateStatus} date</span>
                                            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${statusColor(getEventStatus(event, today))}`}>{getEventStatus(event, today)}</span>
                                        </span>
                                    </button>
                                ))}
                                {listMonthEvents.length === 0 && (
                                    <p className="px-5 py-10 text-center text-sm text-[#68766f]">No events are scheduled in {monthTitle} for the selected filters.</p>
                                )}
                            </div>
                        )}
                    </section>

                    {!hasCalendarEvents && filteredEvents.length > 0 && view !== 'List' && (
                        <p className="mt-4 rounded-xl border border-dashed border-[#d7d2c5] bg-white/70 px-5 py-6 text-center text-sm text-[#68766f]">
                            No events are scheduled in {view === 'Week' ? calendarTitle : monthTitle}. Try another date or view.
                        </p>
                    )}

                    {selectedEvent && (
                        <section aria-live="polite" aria-label={`Details for ${selectedEvent.title}`} className="mt-6 overflow-hidden rounded-2xl border border-[#e3ddcf] bg-white shadow-sm">
                            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                                {selectedEvent.imageUrl ? (
                                    <img src={selectedEvent.imageUrl} alt={`${selectedEvent.title} poster`} className="h-56 w-full bg-[#e9e3d5] object-cover md:h-full md:min-h-72" />
                                ) : (
                                    <div className="flex min-h-48 flex-col items-center justify-center gap-2 bg-[#f4f1e8] text-sm text-[#68766f]">
                                        <CalendarDays aria-hidden="true" className="h-8 w-8 text-[#bd8b3d]" />
                                        Event poster or photo not available
                                    </div>
                                )}
                                <div className="p-5 sm:p-7">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full bg-[#f8ebce] px-3 py-1 text-xs font-bold text-[#684b18]">{selectedEvent.category}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${confirmationColor(selectedEvent.dateStatus)}`}>{selectedEvent.dateStatus} date</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(getEventStatus(selectedEvent, today))}`}>{getEventStatus(selectedEvent, today)}</span>
                                    </div>
                                    <h2 className="mt-3 font-serif text-2xl sm:text-3xl">{selectedEvent.title}</h2>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#53645d]">{selectedEvent.excerpt || selectedEvent.description || 'Event description not provided.'}</p>
                                    <dl className="mt-5 grid gap-3 text-sm text-[#53645d] sm:grid-cols-2">
                                        <div className="flex items-start gap-2">
                                            <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                            <div><dt className="font-semibold text-[#173c34]">Dates</dt><dd>{formatDate(parseLocalDate(selectedEvent.startDate))}{selectedEvent.endDate !== selectedEvent.startDate && <> – {formatDate(parseLocalDate(selectedEvent.endDate))}</>}</dd></div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock3 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                            <div><dt className="font-semibold text-[#173c34]">Start time</dt><dd>{selectedEvent.startTime || 'Not provided'}{selectedEvent.startTime ? ' (Philippine time)' : ''}</dd></div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                            <div><dt className="font-semibold text-[#173c34]">Venue</dt><dd>{selectedEvent.venue || 'Not provided'}</dd></div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <UserRound aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                            <div><dt className="font-semibold text-[#173c34]">Organizer</dt><dd>{selectedEvent.organizer || 'Not provided'}</dd></div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Phone aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#bd8b3d]" />
                                            <div><dt className="font-semibold text-[#173c34]">Contact</dt><dd className="whitespace-pre-line">{selectedEvent.contactInformation || 'Not provided'}</dd></div>
                                        </div>
                                    </dl>
                                    {selectedEvent.description && selectedEvent.excerpt && selectedEvent.description !== selectedEvent.excerpt && (
                                        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#53645d]">{selectedEvent.description}</p>
                                    )}
                                    {selectedEvent.sourceUrl && (
                                        <a href={selectedEvent.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#173c34] underline decoration-[#bd8b3d] underline-offset-4">
                                            Official source <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            {selectedEvent.images.filter((image) => image.url !== selectedEvent.imageUrl).length > 0 && (
                                <div className="grid grid-cols-2 gap-2 border-t border-[#eee9df] p-4 sm:grid-cols-4">
                                    {selectedEvent.images
                                        .filter((image) => image.url !== selectedEvent.imageUrl)
                                        .map((image, index) => (
                                            <img key={`${image.url}-${index}`} src={image.url} alt={`${selectedEvent.title} photo ${index + 1}`} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                                        ))}
                                </div>
                            )}
                        </section>
                    )}

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <EventList title="Upcoming & ongoing" events={upcomingEvents} today={today} onSelect={setSelectedEventId} />
                        <EventList title="Past events" events={pastEvents} today={today} onSelect={setSelectedEventId} />
                    </div>

                    {events.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-[#e3ddcf] bg-white px-5 py-10 text-center">
                            <CalendarDays aria-hidden="true" className="mx-auto h-8 w-8 text-[#bd8b3d]" />
                            <h2 className="mt-3 font-serif text-2xl">Event dates are not published yet</h2>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#68766f]">
                                The calendar only shows published municipal Event and Festival announcements with a recorded event date. Check the official source before making plans.
                            </p>
                            <Link href="/discover/buyogan-festival" className="mt-5 inline-flex rounded-full bg-[#173c34] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#245548]">Discover Buyogan Festival</Link>
                        </div>
                    )}
                    {events.length > 0 && filteredEvents.length === 0 && (
                        <p className="mt-6 rounded-xl border border-dashed border-[#d7d2c5] bg-white p-6 text-center text-sm text-[#68766f]">No events match these filters.</p>
                    )}
                </main>
            </div>
        </>
    );
}

function EventList({
    title,
    events,
    today,
    onSelect,
}: {
    title: string;
    events: EventRecord[];
    today: string;
    onSelect: (eventId: number) => void;
}) {
    return (
        <section aria-label={title} className="rounded-2xl border border-[#e3ddcf] bg-white p-4 sm:p-5">
            <h2 className="font-serif text-2xl">{title}</h2>
            {events.length > 0 ? (
                <ul className="mt-3 divide-y divide-[#eee7da]">
                    {events.map((event) => (
                        <li key={event.id}>
                            <button type="button" onClick={() => onSelect(event.id)} className="flex w-full flex-col gap-1 py-3 text-left sm:flex-row sm:items-start sm:justify-between">
                                <span>
                                    <span className="block font-semibold">{event.title}</span>
                                    <span className="mt-1 block text-sm text-[#68766f]">{formatDate(parseLocalDate(event.startDate))}{event.endDate !== event.startDate && <> – {formatDate(parseLocalDate(event.endDate))}</>} · {event.category}</span>
                                </span>
                                <span className="flex flex-wrap gap-2">
                                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${confirmationColor(event.dateStatus)}`}>{event.dateStatus} date</span>
                                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${statusColor(getEventStatus(event, today))}`}>{getEventStatus(event, today)}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-3 py-3 text-sm text-[#68766f]">No {title.toLocaleLowerCase()} to show.</p>
            )}
        </section>
    );
}
