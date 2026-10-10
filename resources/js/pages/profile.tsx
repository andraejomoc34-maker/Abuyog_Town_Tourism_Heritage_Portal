import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from 'react';
import AuthenticatedNavigation from '../components/AuthenticatedNavigation';

export default function Profile() {
    const { auth } = usePage().props;
    const user = auth.user;
    const form = useForm<{
        name: string;
        email: string;
        contact_number: string;
        profile_photo: File | null;
    }>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        contact_number: user?.contact_number ?? '',
        profile_photo: null,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!form.data.profile_photo) {
            setPhotoPreviewUrl(null);

            return;
        }

        const previewUrl = URL.createObjectURL(form.data.profile_photo);
        setPhotoPreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [form.data.profile_photo]);

    if (!user) {
        return null;
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.transform((data) => ({ ...data, _method: 'patch' }));
        form.post('/profile', {
            forceFormData: true,
            onSuccess: () => form.setData('profile_photo', null),
        });
    }

    function selectProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        const acceptedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (
            !acceptedExtensions.includes(extension ?? '') ||
            (file.type && !acceptedMimeTypes.includes(file.type))
        ) {
            form.setError('profile_photo', 'Choose a JPG, PNG, or WEBP image.');
            event.target.value = '';

            return;
        }

        form.clearErrors('profile_photo');
        form.setData('profile_photo', file);
        event.target.value = '';
    }

    return (
        <>
            <Head title="Profile" />
            <div className="min-h-screen bg-[#fbf8f0] text-[#173c34]">
                <AuthenticatedNavigation />
                <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
                    <p className="text-xs font-bold tracking-[0.22em] text-[#bd8b3d]">
                        YOUR ABUYOG ACCOUNT
                    </p>
                    <h1 className="mt-4 font-serif text-4xl font-normal sm:text-5xl">
                        Profile
                    </h1>
                    <p className="mt-4 text-base leading-7 text-[#68766f]">
                        Account information for {user.name}.
                    </p>
                    <form
                        className="mt-10 max-w-xl space-y-6 border-t border-[#dce3dc] py-8"
                        onSubmit={submit}
                    >
                        <div className="flex items-center gap-5">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8eee8] text-xl font-semibold text-[#123d36]">
                                {photoPreviewUrl ? (
                                    <img
                                        src={photoPreviewUrl}
                                        alt="Selected profile photo preview"
                                        className="size-full object-cover"
                                    />
                                ) : user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={`${user.name}'s profile photo`}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold">Profile photo</p>
                                <button
                                    className="rounded-sm border border-[#123d36] px-4 py-2 text-sm font-semibold text-[#123d36] transition hover:bg-[#edf2ed] disabled:opacity-60"
                                    type="button"
                                    disabled={form.processing}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change Photo
                                </button>
                                <input
                                    ref={fileInputRef}
                                    className="sr-only"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    aria-label="Choose a profile photo"
                                    onChange={selectProfilePhoto}
                                />
                                <p className="text-xs text-[#68766f]">
                                    JPG, PNG, or WEBP, up to 5 MB
                                </p>
                                {form.errors.profile_photo && (
                                    <p className="text-sm text-[#a3483f]">
                                        {form.errors.profile_photo}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label
                                className="mb-2 block text-sm font-semibold"
                                htmlFor="name"
                            >
                                User name
                            </label>
                            <input
                                id="name"
                                className="w-full rounded-sm border border-[#dce3dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#123d36]"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                autoComplete="name"
                            />
                            {form.errors.name && (
                                <p className="mt-2 text-sm text-[#a3483f]">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                className="mb-2 block text-sm font-semibold"
                                htmlFor="email"
                            >
                                User email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="w-full rounded-sm border border-[#dce3dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#123d36]"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                autoComplete="email"
                            />
                            {form.errors.email && (
                                <p className="mt-2 text-sm text-[#a3483f]">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label
                                className="mb-2 block text-sm font-semibold"
                                htmlFor="contact_number"
                            >
                                Contact number
                            </label>
                            <input
                                id="contact_number"
                                type="tel"
                                className="w-full rounded-sm border border-[#dce3dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#123d36]"
                                value={form.data.contact_number}
                                onChange={(event) =>
                                    form.setData(
                                        'contact_number',
                                        event.target.value,
                                    )
                                }
                                autoComplete="tel"
                            />
                            {form.errors.contact_number && (
                                <p className="mt-2 text-sm text-[#a3483f]">
                                    {form.errors.contact_number}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-5">
                            <button
                                className="rounded-none bg-[#123d36] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#092c28] disabled:opacity-60"
                                type="submit"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Saving...' : 'Save changes'}
                            </button>
                            {form.recentlySuccessful && (
                                <p className="text-sm text-[#68766f]">
                                    Profile updated successfully.
                                </p>
                            )}
                        </div>
                    </form>
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold text-[#123d36] underline underline-offset-4"
                    >
                        Return to dashboard
                    </Link>
                </main>
            </div>
        </>
    );
}
