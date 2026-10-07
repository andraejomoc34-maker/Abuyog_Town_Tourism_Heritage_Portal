import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Abuyog Tourism & Heritage Portal';

void createInertiaApp({
    title: (title) => (title && title !== appName ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
});
