import { Link, router, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';

const links = [
    { label: 'Home', href: '/#home' },
    { label: 'Discover', href: '/discover' },
    { label: 'Resorts', href: '/resorts' },
    { label: 'History', href: '/#history' },
    { label: 'Festivals & Events', href: '/#festival' },
    { label: 'Travel Guide', href: '/travel-guide' },
    { label: 'Map', href: '/map' },
    { label: 'About', href: '/#welcome' },
];

export default function PublicMobileMenu({
    desktopNavigation = false,
}: {
    desktopNavigation?: boolean;
}) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const visibility = desktopNavigation ? 'md:hidden' : 'lg:hidden';
    const closeMenu = () => setOpen(false);

    return (
        <div className={`relative ${visibility}`} onKeyDown={(event) => {
            if (event.key === 'Escape') {
                closeMenu();
                buttonRef.current?.focus();
            }
        }}>
            <button
                ref={buttonRef}
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-white/40 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#edbd73]"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
                aria-controls="public-mobile-navigation"
                onClick={() => setOpen((isOpen) => !isOpen)}
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <nav
                id="public-mobile-navigation"
                aria-label="Mobile navigation"
                aria-hidden={!open}
                className={`absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-xl border border-[#e3ddcf] bg-[#fffdf8] p-2 text-[#173c34] shadow-[0_18px_45px_rgba(9,44,40,.22)] transition duration-200 ${open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible pointer-events-none -translate-y-2 scale-[.98] opacity-0'}`}
            >
                <div className="max-h-[min(70vh,32rem)] overflow-y-auto">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            tabIndex={open ? 0 : -1}
                            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition hover:bg-[#f3efe7] focus-visible:bg-[#f3efe7] focus-visible:outline-none"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="my-2 border-t border-[#e9e0d0]" />
                    {auth.user ? (
                        <>
                            <Link href="/dashboard" onClick={closeMenu} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:bg-[#f3efe7]">Dashboard</Link>
                            <Link href="/profile" onClick={closeMenu} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-[#f3efe7]">Profile</Link>
                            <button type="button" onClick={() => { closeMenu(); router.post('/logout'); }} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium hover:bg-[#f3efe7]">Log out</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={closeMenu} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-[#f3efe7]">Log in</Link>
                            <Link href="/register" onClick={closeMenu} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center rounded-lg bg-[#173c34] px-3 text-sm font-semibold text-white hover:bg-[#245548]">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
