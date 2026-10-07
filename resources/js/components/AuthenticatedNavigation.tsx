import { Link, router } from '@inertiajs/react';
import PublicMobileMenu from './PublicMobileMenu';

export default function AuthenticatedNavigation() {
    return (
        <header className="bg-[#123d36] text-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/Bee%20Symbol.jpg" alt="Bee Symbol" className="h-10 w-10 shrink-0 object-contain" />
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
                    className="hidden items-center gap-x-5 gap-y-2 text-xs font-medium text-white/80 lg:flex"
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
                    className="hidden rounded-none border border-white/40 px-4 py-2 text-xs font-semibold transition hover:bg-white/10 lg:inline-flex"
                >
                    Log out
                </button>
                <PublicMobileMenu />
            </div>
        </header>
    );
}
