type PortalLogoProps = {
    className?: string;
};

export default function PortalLogo({
    className = 'h-10 w-10 shrink-0 object-contain',
}: PortalLogoProps) {
    return (
        <img
            alt="Abuyog Tourism and Heritage Portal bee logo"
            className={className}
            src="/Bee%20Symbol.jpg"
        />
    );
}
