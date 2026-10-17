import { useEffect } from 'react';

type PreloaderElement = HTMLElement & {
    dataset: DOMStringMap & {
        startedAt?: string;
        minimumDuration?: string;
        fadeDuration?: string;
    };
};

export function useInitialPreloader(): void {
    useEffect(() => {
        const preloader = document.getElementById('initial-preloader') as PreloaderElement | null;

        if (!preloader) {
            return;
        }

        const minimumDuration = Number(preloader.dataset.minimumDuration) || 5000;
        const fadeDuration = Number(preloader.dataset.fadeDuration) || 350;
        const startedAt = Number(preloader.dataset.startedAt) || performance.now();
        const elapsed = Math.max(0, performance.now() - startedAt);
        let fadeTimer = 0;
        let playbackTimer = 0;
        const timer = window.setTimeout(() => {
            preloader.classList.add('is-exiting');
            preloader.setAttribute('aria-hidden', 'true');
            fadeTimer = window.setTimeout(() => {
                preloader.hidden = true;
            }, fadeDuration);
        }, Math.max(0, minimumDuration - elapsed));
        const video = preloader.querySelector('video');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const hideVideo = () => {
            window.clearTimeout(playbackTimer);

            if (video instanceof HTMLVideoElement) {
                video.hidden = true;
            }
        };
        const markVideoStarted = () => {
            window.clearTimeout(playbackTimer);
        };
        const playVideo = () => {
            if (reducedMotion.matches || !(video instanceof HTMLVideoElement)) {
                hideVideo();
                return;
            }

            video.hidden = false;
            void video.play().catch(hideVideo);
            window.clearTimeout(playbackTimer);
            playbackTimer = window.setTimeout(() => {
                if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
                    hideVideo();
                }
            }, 3000);
        };

        if (video instanceof HTMLVideoElement) {
            video.addEventListener('playing', markVideoStarted);
            video.addEventListener('error', hideVideo);
            reducedMotion.addEventListener('change', playVideo);
            playVideo();
        }

        return () => {
            window.clearTimeout(timer);
            window.clearTimeout(fadeTimer);
            window.clearTimeout(playbackTimer);
            video?.removeEventListener('playing', markVideoStarted);
            video?.removeEventListener('error', hideVideo);
            reducedMotion.removeEventListener('change', playVideo);
        };
    }, []);
}
