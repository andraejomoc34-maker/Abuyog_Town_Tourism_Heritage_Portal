import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { home } from '@/routes';

type AuthShellProps = {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
};

export default function AuthShell({
    eyebrow,
    title,
    description,
    children,
}: AuthShellProps) {
    return (
        <>
            <Head title={title} />
            <main className="auth-layout">
                <section
                    className="auth-visual"
                    aria-label="Abuyog coastal scenery"
                >
                    <div className="auth-visual__topline">
                        <Link href={home()} className="brand brand--light">
                            <span className="brand__mark" aria-hidden="true">
                                ✦
                            </span>
                            <span>
                                <strong>ABUYOG</strong>
                                <small>Town Tourism</small>
                            </span>
                        </Link>
                        <span className="location-pill">
                            LEYTE · PHILIPPINES
                        </span>
                    </div>
                    <div className="auth-visual__copy">
                        <p className="eyebrow eyebrow--light">{eyebrow}</p>
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                    <div className="auth-visual__footer">
                        <span>Discover the heart of Leyte</span>
                        <span className="auth-visual__line" />
                        <span>10°44′N · 125°01′E</span>
                    </div>
                </section>
                <section className="auth-panel">
                    <div className="auth-panel__inner">
                        <Link href={home()} className="brand brand--dark">
                            <span className="brand__mark" aria-hidden="true">
                                ✦
                            </span>
                            <span>
                                <strong>ABUYOG</strong>
                                <small>
                                    Town Tourism &amp; Heritage Portal
                                </small>
                            </span>
                        </Link>
                        {children}
                    </div>
                </section>
            </main>
        </>
    );
}
