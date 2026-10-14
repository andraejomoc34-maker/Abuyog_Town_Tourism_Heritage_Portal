<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}" sizes="any">
        <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <div class="initial-preloader" id="initial-preloader" role="status" aria-live="polite">
            <div class="initial-preloader__art">
                <img
                    class="initial-preloader__image"
                    src="{{ asset('images/abuyog-preloader.png') }}"
                    alt=""
                    fetchpriority="high"
                    decoding="async"
                >
                <span class="initial-preloader__spinner" aria-hidden="true"></span>
                <span class="initial-preloader__message">Preparing your Abuyog experience…</span>
            </div>
        </div>
        <script>
            (() => {
                const preloader = document.getElementById('initial-preloader');

                if (!preloader) {
                    return;
                }

                preloader.dataset.fallbackTimer = window.setTimeout(() => {
                    preloader.classList.add('is-exiting');
                    window.setTimeout(() => preloader.remove(), 400);
                }, 12000).toString();
            })();
        </script>
        <x-inertia::app />
    </body>
</html>
