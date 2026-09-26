import { Link, router } from '@inertiajs/react';

export default function AuthenticatedNavigation() {
    return (
        <header className="bg-[#123d36] text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5 lg:px-10">
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
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/80"
                    aria-label="Main navigation"
                >
                    <Link className="hover:text-[#e4b866]" href="/">
                        Home
                    </Link>
                    <Link className="hover:text-[#e4b866]" href="/#discover">
                        Tourist Spots
                    </Link>
                    <Link className="hover:text-[#e4b866]" href="/#heritage">
                        Heritage
                    </Link>
                    <Link className="hover:text-[#e4b866]" href="/#culture">
                        Culture
                    </Link>
                    <Link className="hover:text-[#e4b866]" href="/#festival">
                        Festivals
                    </Link>
                    <Link className="text-white" href="/dashboard">
                        Dashboard
                    </Link>
                    <Link className="hover:text-[#e4b866]" href="/profile">
                        Profile
                    </Link>
                </nav>
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold transition hover:bg-white/10"
                >
                    Log out
                </button>
            </div>
        </header>
    );
}
