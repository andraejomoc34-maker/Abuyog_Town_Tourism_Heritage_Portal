import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download } from 'lucide-react';

type WebsiteQrCodeProps = {
    websiteUrl: string;
};

type WebsiteUrlKind = 'local' | 'public' | 'invalid';

function getWebsiteUrlKind(value: string): WebsiteUrlKind {
    try {
        if (!value || value !== value.trim()) {
            return 'invalid';
        }

        const url = new URL(value);
        const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
        const isLoopbackAddress =
            hostname === 'localhost' ||
            hostname.endsWith('.localhost') ||
            hostname === '127.0.0.1' ||
            hostname === '[::1]';
        const isLocalHostname =
            isLoopbackAddress ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.test') ||
            hostname.endsWith('.invalid') ||
            hostname.endsWith('.example');
        const isIpAddress =
            /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
            hostname.startsWith('[');

        if (url.username || url.password) {
            return 'invalid';
        }

        if (
            isLoopbackAddress &&
            (url.protocol === 'http:' || url.protocol === 'https:')
        ) {
            return 'local';
        }

        if (
            url.protocol === 'https:' &&
            hostname.includes('.') &&
            !isIpAddress &&
            !isLocalHostname
        ) {
            return 'public';
        }

        return 'invalid';
    } catch {
        return 'invalid';
    }
}

export default function WebsiteQrCode({ websiteUrl }: WebsiteQrCodeProps) {
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

    const websiteUrlKind = getWebsiteUrlKind(websiteUrl);
    const canGenerateQrCode = websiteUrlKind !== 'invalid';
    const qrCode = useMemo(() => {
        if (!canGenerateQrCode) {
            return { size: 0, path: '', error: null };
        }

        try {
            const modules = QRCode.create(websiteUrl, {
                errorCorrectionLevel: 'H',
            }).modules;
            let path = '';

            for (let row = 0; row < modules.size; row += 1) {
                for (let column = 0; column < modules.size; column += 1) {
                    if (modules.get(row, column)) {
                        path += `M${column} ${row}h1v1h-1z`;
                    }
                }
            }

            return { size: modules.size, path, error: null };
        } catch {
            return {
                size: 0,
                path: '',
                error: 'The QR code could not be generated for this URL.',
            };
        }
    }, [canGenerateQrCode, websiteUrl]);

    async function copyWebsiteUrl(): Promise<void> {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(websiteUrl);
            } else {
                const input = document.createElement('textarea');
                input.value = websiteUrl;
                input.setAttribute('readonly', '');
                input.style.position = 'absolute';
                input.style.left = '-9999px';
                document.body.appendChild(input);
                input.select();
                const wasCopied = document.execCommand('copy');
                input.remove();

                if (!wasCopied) {
                    throw new Error('Clipboard access is unavailable.');
                }
            }

            setCopyMessage('Website address copied.');
        } catch {
            setCopyMessage(
                'Unable to copy automatically. Please copy the address above.',
            );
        }
    }

    async function downloadQrCode(): Promise<void> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(websiteUrl, {
                errorCorrectionLevel: 'H',
                margin: 4,
                width: 512,
                color: {
                    dark: '#173c34',
                    light: '#ffffff',
                },
            });
            const downloadLink = document.createElement('a');
            downloadLink.href = qrCodeDataUrl;
            downloadLink.download = 'abuyog-tourism-website-qr.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            setDownloadMessage('PNG download started.');
        } catch {
            setDownloadMessage(
                'Unable to download the QR code. Please try again.',
            );
        }
    }

    return (
        <section className="bg-[#f8f3e8] px-6 py-16 sm:py-20 lg:px-10">
            <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-3xl border border-[#e3ddcf] bg-white p-7 shadow-[0_18px_45px_rgba(23,60,52,0.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:gap-16 lg:p-12">
                <div>
                    <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                        TAKE ABUYOG WITH YOU
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-normal text-[#173c34] sm:text-4xl">
                        Scan to Visit Abuyog
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[#718078] sm:text-base">
                        Scan this QR code with your phone camera to explore
                        Abuyog&apos;s tourism, history, heritage, and
                        attractions.
                    </p>
                    <p className="mt-5 text-sm font-medium text-[#173c34]">
                        Point your phone camera at the code to open the website.
                    </p>

                    <p className="mt-6 text-xs font-bold tracking-wider text-[#718078] uppercase">
                        Website address
                    </p>
                    <a
                        className="mt-2 inline-block max-w-full text-sm font-semibold break-all text-[#1b574b] underline decoration-[#d99d4b] underline-offset-4"
                        href={canGenerateQrCode ? websiteUrl : undefined}
                        rel={canGenerateQrCode ? 'noreferrer' : undefined}
                        target={canGenerateQrCode ? '_blank' : undefined}
                    >
                        {websiteUrl}
                    </a>

                    {websiteUrlKind === 'local' && (
                        <p
                            className="mt-4 rounded-xl border border-[#e8c98e] bg-[#fff8e9] px-4 py-3 text-sm leading-6 text-[#76521d]"
                            role="status"
                        >
                            This QR code is for local testing only. A phone
                            scanning <code>{websiteUrl}</code> will try to open
                            its own loopback address, not this computer. For
                            visitors to reach the site, deploy it on a public
                            HTTPS domain or use a properly secured HTTPS
                            development tunnel.
                        </p>
                    )}

                    {websiteUrlKind === 'invalid' && (
                        <p
                            className="mt-4 rounded-xl border border-[#e8c98e] bg-[#fff8e9] px-4 py-3 text-sm leading-6 text-[#76521d]"
                            role="status"
                        >
                            A valid website address is not configured. Set{' '}
                            <code>APP_URL</code> to a local loopback address for
                            development or to your public HTTPS domain after
                            deployment.
                        </p>
                    )}

                    {qrCode.error && (
                        <p className="mt-4 text-sm text-red-700" role="alert">
                            {qrCode.error}
                        </p>
                    )}

                    {canGenerateQrCode && qrCode.path && (
                        <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                className="inline-flex items-center gap-2 rounded-lg bg-[#173c34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b574b]"
                                onClick={downloadQrCode}
                                type="button"
                            >
                                <Download
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Download QR Code
                            </button>
                            <button
                                className="inline-flex items-center gap-2 rounded-lg border border-[#173c34] px-5 py-3 text-sm font-semibold text-[#173c34] transition hover:bg-[#f0eadc]"
                                onClick={copyWebsiteUrl}
                                type="button"
                            >
                                {copyMessage === 'Website address copied.' ? (
                                    <Check
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Copy
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                )}
                                Copy website URL
                            </button>
                            <a
                                className="inline-flex items-center gap-2 rounded-lg border border-[#173c34] px-5 py-3 text-sm font-semibold text-[#173c34] transition hover:bg-[#f0eadc]"
                                href={websiteUrl}
                                rel="noreferrer"
                                target="_blank"
                            >
                                Open Website
                            </a>
                        </div>
                    )}

                    {copyMessage && (
                        <p
                            className="mt-3 text-sm text-[#245b3d]"
                            role="status"
                        >
                            {copyMessage}
                        </p>
                    )}
                    {downloadMessage && (
                        <p
                            className="mt-3 text-sm text-[#245b3d]"
                            role="status"
                        >
                            {downloadMessage}
                        </p>
                    )}
                </div>

                <div className="mx-auto w-full max-w-[19rem] rounded-2xl border border-[#e3ddcf] bg-[#fbfaf7] p-4 shadow-inner">
                    {canGenerateQrCode && qrCode.path ? (
                        <svg
                            aria-label="QR code linking to the Abuyog Tourism and Heritage Portal"
                            className="block h-auto w-full bg-white"
                            role="img"
                            shapeRendering="crispEdges"
                            viewBox={`-4 -4 ${qrCode.size + 8} ${qrCode.size + 8}`}
                        >
                            <rect
                                x="-4"
                                y="-4"
                                width={qrCode.size + 8}
                                height={qrCode.size + 8}
                                fill="#ffffff"
                            />
                            <path d={qrCode.path} fill="#173c34" />
                        </svg>
                    ) : (
                        <div
                            aria-label="QR code unavailable for the configured URL"
                            className="flex aspect-square items-center justify-center bg-white p-6 text-center text-sm leading-6 text-[#718078]"
                            role="img"
                        >
                            {qrCode.error ??
                                'QR code unavailable: configure a local URL or public HTTPS URL.'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
