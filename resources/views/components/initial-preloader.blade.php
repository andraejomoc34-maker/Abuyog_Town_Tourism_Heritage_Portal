<div
    aria-live="polite"
    class="initial-preloader"
    id="initial-preloader"
    role="status"
    style="
        --preloader-background: {{ config('preloader.background_color') }};
        --preloader-text: {{ config('preloader.text_color') }};
        --preloader-accent: {{ config('preloader.accent_color') }};
        --preloader-overlay: {{ config('preloader.overlay_color') }};
        --preloader-fade-duration: {{ config('preloader.fade_duration_ms') }}ms;
    "
    data-minimum-duration="{{ config('preloader.duration_ms') }}"
    data-fade-duration="{{ config('preloader.fade_duration_ms') }}"
>
    <img
        alt=""
        class="initial-preloader__fallback"
        fetchpriority="high"
        src="{{ asset(config('preloader.fallback_image')) }}"
    >
    <video
        aria-hidden="true"
        autoplay
        class="initial-preloader__video"
        loop
        muted
        playsinline
        poster="{{ asset(config('preloader.fallback_image')) }}"
        preload="auto"
    >
        <source src="{{ asset(config('preloader.video')) }}" type="video/mp4">
    </video>
    <div aria-hidden="true" class="initial-preloader__shade"></div>
    <div class="initial-preloader__content">
        <img
            alt="Abuyog Tourism and Heritage Portal bee logo"
            class="initial-preloader__logo"
            src="{{ asset(config('preloader.logo')) }}"
        >
        <p class="initial-preloader__eyebrow">ABUYOG TOWN TOURISM &amp; HERITAGE</p>
        <h1 class="initial-preloader__title">{{ config('preloader.title') }}</h1>
        <p class="initial-preloader__subtitle">{{ config('preloader.subtitle') }}</p>
        <div
            aria-label="{{ config('preloader.loading_label') }}"
            class="initial-preloader__track"
            role="progressbar"
        >
            <span class="initial-preloader__bar"></span>
        </div>
        <span class="initial-preloader__loading-label">{{ config('preloader.loading_label') }}</span>
    </div>
</div>
<script>
    (() => {
        const preloader = document.getElementById('initial-preloader');

        if (preloader) {
            preloader.dataset.startedAt = performance.now().toString();
        }
    })();
</script>
