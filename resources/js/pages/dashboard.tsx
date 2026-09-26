import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedNavigation from '../components/AuthenticatedNavigation';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;

    if (!user) {
        return null;
    }

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <AuthenticatedNavigation />
                <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
                    <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                        YOUR ABUYOG ACCOUNT
                    </p>
                    <h1 className="mt-4 font-serif text-4xl font-normal sm:text-5xl">
                        Welcome, {user.name}!
                    </h1>
                    <p className="mt-4 text-base leading-7 text-[#68766f]">
                        Signed in as {user.email}
                    </p>
                    <div className="mt-12 border-t border-[#dce3dc] py-8">
                        <h2 className="font-serif text-2xl font-normal">
                            Account
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#68766f]">
                            Your account is ready. Manage your personal details
                            or continue exploring Abuyog.
                        </p>
                        <Link
                            href="/profile"
                            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#123d36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#092c28]"
                        >
                            View profile{' '}
                            <span aria-hidden="true">{'\u2197'}</span>
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
