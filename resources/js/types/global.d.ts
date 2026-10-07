import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            announcements?: Array<{
                id: number;
                title: string;
                slug: string;
                excerpt: string | null;
                category: string;
                featuredImageUrl: string | null;
                publishedAt: string | null;
            }>;
            [key: string]: unknown;
        };
    }
}
