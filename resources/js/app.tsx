import { createInertiaApp } from '@inertiajs/react';
import { Amplify } from 'aws-amplify';
import { useEffect, type ReactNode } from 'react';

const appName =
    import.meta.env.VITE_APP_NAME || 'Abuyog Tourism & Heritage Portal';
const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID;
const faceLivenessRegion = import.meta.env.VITE_AWS_FACE_LIVENESS_REGION;

if (identityPoolId && faceLivenessRegion) {
    Amplify.configure({
        Auth: {
            Cognito: {
                identityPoolId,
                allowGuestAccess: true,
            },
        },
    });
}

function InitialApp({ children }: { children: ReactNode }) {
    useEffect(() => {
        const preloader = document.getElementById('initial-preloader');

        if (!preloader) {
            return;
        }

        const fallbackTimer = Number(preloader.dataset.fallbackTimer);
        window.clearTimeout(fallbackTimer);

        const removePreloader = () => preloader.remove();
        const removeAfterFade = (event: TransitionEvent) => {
            if (event.target === preloader && event.propertyName === 'opacity') {
                removePreloader();
            }
        };

        preloader.addEventListener('transitionend', removeAfterFade);
        preloader.classList.add('is-exiting');
        const transitionTimer = window.setTimeout(removePreloader, 400);

        return () => {
            preloader.removeEventListener('transitionend', removeAfterFade);
            window.clearTimeout(transitionTimer);
        };
    }, []);

    return children;
}

void createInertiaApp({
    title: (title) =>
        title && title !== appName ? `${title} - ${appName}` : appName,
    withApp: (app) => <InitialApp>{app}</InitialApp>,
    progress: {
        color: '#4B5563',
    },
});
