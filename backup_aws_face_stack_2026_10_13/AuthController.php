<?php

namespace App\Http\Controllers;

use App\Exceptions\DuplicateFaceIdentityException;
use App\Exceptions\UncertainFaceIdentityException;
use App\Models\Booking;
use App\Models\Inquiry;
use App\Models\Resort;
use App\Models\User;
use App\Services\FaceIdentityService;
use App\Services\FaceLivenessService;
use App\Services\FaceRecognitionService;
use Aws\Exception\AwsException;
use Aws\Exception\CredentialsException;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\FacebookProvider;
use Laravel\Socialite\Two\InvalidStateException;
use Throwable;

class AuthController extends Controller
{
    private const FACE_LIVENESS_NOT_CONFIGURED = 'Face liveness is not configured on this site. Please contact the site administrator.';

    private const FACE_MATCHING_NOT_CONFIGURED = 'Face matching is not configured on this site. Please contact the site administrator.';

    private const FACE_VERIFICATION_ADMIN_ERROR = 'Face verification service configuration needs attention. Please contact the site administrator.';

    private const FACE_VERIFICATION_TEMPORARY_ERROR = 'Face verification service is temporarily unavailable. Please try again shortly.';

    public function createLogin(): Response
    {
        return Inertia::render('auth/login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        if (! Auth::attempt($credentials, $remember)) {
            return back()->withErrors([
                'email' => 'Those credentials do not match our records.',
            ])->onlyInput('email');
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user instanceof User && ! $user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'This account has been disabled.',
            ])->onlyInput('email');
        }

        $intendedUrl = $request->session()->pull('intended_url');

        if ($user && $user->role === 'hotel_admin') {
            return redirect()->to($intendedUrl ?: route('hotel-admin.dashboard'));
        }

        if ($user && $user->role === 'resort_admin') {
            return redirect()->to($intendedUrl ?: route('admin.resort.dashboard'));
        }

        if ($user && $user->role === 'super_admin') {
            return redirect()->to($intendedUrl ?: route('super-admin.dashboard'));
        }

        if ($user && $user->role === 'municipality_admin') {
            return redirect()->to($intendedUrl ?: route('municipality-admin.dashboard'));
        }

        return redirect()->to($intendedUrl ?: route('dashboard'));
    }

    public function redirectToFacebook(): \Symfony\Component\HttpFoundation\RedirectResponse
    {
        if (! $this->facebookIsConfigured()) {
            return $this->facebookLoginError(
                request(),
                'Facebook login is not configured. Please use email and password or contact the site administrator.',
            );
        }

        /** @var FacebookProvider $facebookProvider */
        $facebookProvider = Socialite::driver('facebook');

        return $facebookProvider
            ->scopes(['email', 'public_profile'])
            ->redirect();
    }

    public function handleFacebookCallback(Request $request): RedirectResponse
    {
        if (! $this->facebookIsConfigured()) {
            return $this->facebookLoginError(
                $request,
                'Facebook login is not configured. Please use email and password or contact the site administrator.',
            );
        }

        if ($request->query('error') !== null || $request->query('error_reason') !== null) {
            return $this->facebookLoginError(
                $request,
                'Facebook sign-in was cancelled. You can continue with email and password.',
            );
        }

        try {
            $facebookUser = Socialite::driver('facebook')->user();
        } catch (InvalidStateException) {
            return $this->facebookLoginError(
                $request,
                'Facebook sign-in expired or could not be verified. Please try again.',
            );
        } catch (Throwable) {
            return $this->facebookLoginError(
                $request,
                'Facebook could not complete sign-in. Please try again or use email and password.',
            );
        }

        $facebookId = trim((string) $facebookUser->getId());

        if ($facebookId === '') {
            return $this->facebookLoginError(
                $request,
                'Facebook did not return a valid account identifier. Please try again.',
            );
        }

        $user = User::query()->where('facebook_id', $facebookId)->first();

        if ($user) {
            if ($user->role !== 'user') {
                return $this->facebookLoginError(
                    $request,
                    'Facebook sign-in is available for customer accounts only. Use your existing administrator sign-in.',
                );
            }

            if (! $user->is_active) {
                return $this->facebookLoginError($request, 'This account has been disabled.');
            }

            $request->session()->forget('pending_facebook_signup');
            Auth::login($user);
            $request->session()->regenerate();

            if (blank($user->contact_number)) {
                return redirect()->route('auth.complete-profile')->with(
                    'success',
                    'Please complete your account information.',
                );
            }

            return redirect()->route($this->resolveDashboardRouteFor($user));
        }

        $validatedEmail = filter_var(
            strtolower(trim((string) ($facebookUser->getEmail() ?? ''))),
            FILTER_VALIDATE_EMAIL,
        );
        $email = is_string($validatedEmail) ? $validatedEmail : null;

        if ($email !== null && User::query()->whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return $this->facebookLoginError(
                $request,
                'An account already uses this email address. Sign in with your existing method; Facebook was not linked.',
            );
        }

        $name = trim((string) ($facebookUser->getName() ?? ''));
        $request->session()->put('pending_facebook_signup', [
            'name' => $name !== '' ? $name : 'Facebook User',
            'email' => $email,
            'facebook_id' => $facebookId,
        ]);

        return redirect()->route('register');
    }

    private function facebookIsConfigured(): bool
    {
        return filled(config('services.facebook.client_id'))
            && filled(config('services.facebook.client_secret'))
            && filled(config('services.facebook.redirect'));
    }

    private function facebookLoginError(Request $request, string $message): RedirectResponse
    {
        $request->session()->forget('pending_facebook_signup');

        return redirect()->route('login')->withErrors(['email' => $message]);
    }

    public function completeProfile(): Response
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            abort(401);
        }

        return Inertia::render('auth/complete-profile', [
            'user' => $user,
        ]);
    }

    public function storeCompleteProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'contact_number' => ['required', 'string', 'max:30'],
        ]);

        $user->update([
            'contact_number' => $validated['contact_number'],
        ]);

        return redirect()->route($this->resolveDashboardRouteFor($user))->with('success', 'Your account is ready.');
    }

    public function createRegistration(
        Request $request,
        FaceLivenessService $faceLiveness,
        FaceRecognitionService $faceRecognition,
    ): Response {
        $verification = $request->session()->get('registration.face_liveness');
        $verifiedAt = is_array($verification) ? ($verification['verified_at'] ?? null) : null;
        $configurationMessage = $this->faceVerificationConfigurationMessage($faceLiveness, $faceRecognition);

        return Inertia::render('auth/register', [
            'faceLiveness' => [
                'configured' => $configurationMessage === null,
                'availabilityMessage' => $configurationMessage,
                'region' => config('services.face_liveness.region'),
                'sessionId' => is_array($verification) ? ($verification['session_id'] ?? null) : null,
                'verified' => ($verification['consent'] ?? false) === true
                    && is_string($verification['session_id'] ?? null)
                    && $faceLiveness->hasVerifiedReferenceImage($verification['session_id'])
                    && is_numeric($verifiedAt)
                    && now()->timestamp - (int) $verifiedAt <= 175
                    && now()->timestamp >= (int) $verifiedAt,
            ],
            'pendingFacebookSignup' => $request->session()->get('pending_facebook_signup') ? [
                'name' => $request->session()->get('pending_facebook_signup.name'),
                'email' => $request->session()->get('pending_facebook_signup.email'),
            ] : null,
        ]);
    }

    public function createFaceLivenessSession(
        Request $request,
        FaceLivenessService $faceLiveness,
        FaceRecognitionService $faceRecognition,
    ): RedirectResponse {
        $request->validate(['face_biometric_consent' => ['accepted']]);

        $configurationMessage = $this->faceVerificationConfigurationMessage($faceLiveness, $faceRecognition);

        if ($configurationMessage !== null) {
            return back()->withErrors([
                'face_verification' => $configurationMessage,
            ]);
        }

        try {
            $sessionId = $faceLiveness->createSession();
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_verification' => $this->faceVerificationFailureMessage($exception),
            ]);
        }

        $request->session()->put('registration.face_liveness', [
            'session_id' => $sessionId,
            'expires_at' => now()->addSeconds(175)->timestamp,
            'verified_at' => null,
            'consent' => true,
        ]);

        return redirect()->route('register');
    }

    public function completeFaceVerification(Request $request, FaceLivenessService $faceLiveness): RedirectResponse
    {
        $verification = $request->session()->get('registration.face_liveness');

        if (! is_array($verification)
            || ! is_string($verification['session_id'] ?? null)
            || ! is_numeric($verification['expires_at'] ?? null)
            || ($verification['consent'] ?? false) !== true
            || now()->timestamp > (int) $verification['expires_at']) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'Verification expired. Please try again.',
            ]);
        }

        try {
            $faceLiveness->storeVerifiedReferenceImage($verification['session_id']);
        } catch (\UnexpectedValueException) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'Verification failed. Please try again.',
            ]);
        } catch (Throwable $exception) {
            report($exception);
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => $this->faceVerificationFailureMessage($exception),
            ]);
        }

        $request->session()->put('registration.face_liveness.verified_at', now()->timestamp);

        return redirect()->route('register');
    }

    public function cancelFaceLivenessSession(Request $request, FaceLivenessService $faceLiveness): RedirectResponse
    {
        $verification = $request->session()->get('registration.face_liveness');
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        if (is_string($sessionId)) {
            $faceLiveness->forgetVerifiedReferenceImage($sessionId);
        }

        $request->session()->forget('registration.face_liveness');

        return redirect()->route('register');
    }

    public function register(
        Request $request,
        FaceLivenessService $faceLiveness,
        FaceIdentityService $faceIdentity,
    ): RedirectResponse {
        if (! $this->hasCurrentFaceVerification($request, $faceLiveness)) {
            return back()->withErrors([
                'face_verification' => 'Complete face verification before creating your account.',
            ]);
        }

        $pendingFacebookSignup = $request->session()->get('pending_facebook_signup');
        $isFacebookSignup = is_array($pendingFacebookSignup);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'contact_number' => [$isFacebookSignup ? 'required' : 'nullable', 'string', 'max:30'],
            'password' => [$isFacebookSignup ? 'nullable' : 'required', 'confirmed', 'string', 'min:8'],
            'terms' => ['accepted'],
            'face_biometric_consent' => ['accepted'],
        ]);

        $pendingFacebookEmail = is_array($pendingFacebookSignup)
            ? ($pendingFacebookSignup['email'] ?? null)
            : null;

        if ($isFacebookSignup
            && filled($pendingFacebookEmail)
            && strtolower($validated['email']) !== strtolower((string) $pendingFacebookEmail)) {
            return back()->withErrors([
                'email' => 'Use the email address returned by Facebook to continue.',
            ]);
        }

        if ($isFacebookSignup
            && User::query()->whereRaw('LOWER(email) = ?', [strtolower($validated['email'])])->exists()) {
            return back()->withErrors([
                'email' => 'This email already belongs to an account. Sign in with your existing method; Facebook was not linked.',
            ]);
        }

        $verification = $request->session()->get('registration.face_liveness');
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        if (! is_string($sessionId)) {
            return back()->withErrors([
                'face_verification' => 'This verification was already used. Please verify again.',
            ]);
        }

        $referenceImage = $faceLiveness->consumeVerifiedReferenceImage($sessionId);

        if ($referenceImage === null) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'Verification expired. Please verify again.',
            ]);
        }

        try {
            $user = $faceIdentity->createUserWithEnrollment(
                $referenceImage,
                fn (): User => User::create([
                    'name' => $isFacebookSignup ? $pendingFacebookSignup['name'] : $validated['name'],
                    'email' => $isFacebookSignup && filled($pendingFacebookEmail)
                        ? $pendingFacebookEmail
                        : $validated['email'],
                    'contact_number' => $validated['contact_number'] ?? null,
                    'password' => Hash::make($isFacebookSignup
                        ? bin2hex(random_bytes(16))
                        : $validated['password']),
                    'role' => 'user',
                    'facebook_id' => $isFacebookSignup ? $pendingFacebookSignup['facebook_id'] : null,
                ]),
            );
        } catch (DuplicateFaceIdentityException) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'An account associated with this face already exists. Please log in to your existing account.',
            ]);
        } catch (UncertainFaceIdentityException) {
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => 'We could not confidently verify this face. Please contact the site administrator for assistance.',
            ]);
        } catch (Throwable $exception) {
            report($exception);
            $request->session()->forget('registration.face_liveness');

            return back()->withErrors([
                'face_verification' => $this->faceVerificationFailureMessage($exception, true),
            ]);
        }

        $request->session()->forget(['registration.face_liveness', 'pending_facebook_signup']);
        Auth::login($user);
        $request->session()->regenerate();

        if (blank($user->contact_number)) {
            return redirect()->route('auth.complete-profile')->with('success', 'Please complete your account information.');
        }

        return redirect()->route('dashboard');
    }

    private function hasCurrentFaceVerification(Request $request, FaceLivenessService $faceLiveness): bool
    {
        $verification = $request->session()->get('registration.face_liveness');
        $verifiedAt = is_array($verification) ? ($verification['verified_at'] ?? null) : null;
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        return is_string($sessionId)
            && ($verification['consent'] ?? false) === true
            && $faceLiveness->hasVerifiedReferenceImage($sessionId)
            && is_numeric($verifiedAt)
            && now()->timestamp - (int) $verifiedAt <= 175
            && now()->timestamp >= (int) $verifiedAt;
    }

    private function faceVerificationConfigurationMessage(
        FaceLivenessService $faceLiveness,
        FaceRecognitionService $faceRecognition,
    ): ?string {
        if (! $faceLiveness->hasBrowserConfiguration()) {
            return self::FACE_LIVENESS_NOT_CONFIGURED;
        }

        if (! $faceRecognition->isConfigured()) {
            return self::FACE_MATCHING_NOT_CONFIGURED;
        }

        return null;
    }

    private function faceVerificationFailureMessage(Throwable $exception, bool $isFaceMatching = false): string
    {
        if ($exception instanceof CredentialsException) {
            return self::FACE_VERIFICATION_ADMIN_ERROR;
        }

        if ($exception instanceof ConnectException) {
            return self::FACE_VERIFICATION_TEMPORARY_ERROR;
        }

        if ($exception instanceof AwsException) {
            $errorCode = $exception->getAwsErrorCode();
            $statusCode = $exception->getStatusCode();

            if (in_array($errorCode, [
                'AccessDenied',
                'AccessDeniedException',
                'InvalidClientTokenId',
                'InvalidSignatureException',
                'UnrecognizedClientException',
                'ResourceNotFoundException',
                'InvalidParameterException',
            ], true) || $statusCode === 403 || $statusCode === 404) {
                return self::FACE_VERIFICATION_ADMIN_ERROR;
            }

            if ($statusCode === 429 || $statusCode >= 500
                || in_array($errorCode, ['LimitExceededException', 'ThrottlingException'], true)) {
                return self::FACE_VERIFICATION_TEMPORARY_ERROR;
            }
        }

        if ($isFaceMatching) {
            return 'Face matching could not be completed. Please try again or contact the site administrator.';
        }

        return 'Face verification could not be completed. Check camera access and your connection, then try again.';
    }

    public function dashboard(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User && $user->role === 'municipality_admin') {
            return redirect()->route('municipality-admin.dashboard');
        }

        if ($user && $user->role === 'resort_admin') {
            return Inertia::render('Admin/ResortDashboard', [
                'user' => $user->loadMissing('resort'),
                'resort' => $user->resort,
            ]);
        }

        if ($user && $user->role === 'super_admin') {
            return Inertia::render('dashboard', [
                'user' => $user,
            ]);
        }

        return Inertia::render('dashboard');
    }

    public function superAdminDashboard(): Response
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'super_admin') {
            abort(403);
        }

        return Inertia::render('dashboard', [
            'user' => $user,
            'super_admin' => true,
            'stats' => [
                'totalUsers' => User::count(),
                'totalResorts' => Resort::count(),
                'totalBookings' => Booking::count(),
                'pendingBookings' => Booking::where('status', 'Pending')->count(),
                'confirmedBookings' => Booking::where('status', 'Confirmed')->count(),
                'totalInquiries' => Inquiry::count(),
            ],
        ]);
    }

    public function profile(Request $request, FaceLivenessService $faceLiveness, FaceRecognitionService $faceRecognition): Response
    {
        $user = $request->user();

        return Inertia::render('profile', [
            'faceEnrollment' => [
                'available' => $faceLiveness->hasBrowserConfiguration() && $faceRecognition->isConfigured(),
                'enrolled' => $user instanceof User && $user->role === 'user' && $user->faceIdentity()->exists(),
                'region' => config('services.face_liveness.region'),
                'sessionId' => $request->session()->get('profile.face_liveness.session_id'),
            ],
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'contact_number' => ['nullable', 'string', 'max:30'],
            'profile_photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $previousPhotoPath = $user->profile_photo_path;
        $profilePhoto = $validated['profile_photo'] ?? null;
        unset($validated['profile_photo']);

        if ($profilePhoto) {
            try {
                $newPhotoPath = Storage::disk('public')->putFile('profile-photos', $profilePhoto);
            } catch (Throwable $exception) {
                report($exception);

                return back()->withErrors([
                    'profile_photo' => 'The profile photo could not be saved. Please try again.',
                ]);
            }

            if (! is_string($newPhotoPath)) {
                report(new \RuntimeException('The public disk did not store the profile photo.'));

                return back()->withErrors([
                    'profile_photo' => 'The profile photo could not be saved. Please try again.',
                ]);
            }

            $user->profile_photo_path = $newPhotoPath;
        }

        try {
            $user->fill($validated)->save();
        } catch (Throwable $exception) {
            if ($profilePhoto && is_string($newPhotoPath ?? null)) {
                Storage::disk('public')->delete($newPhotoPath);
            }

            report($exception);

            return back()->withErrors([
                'profile_photo' => 'Your profile could not be updated. Please try again.',
            ]);
        }

        if ($profilePhoto && $previousPhotoPath) {
            Storage::disk('public')->delete($previousPhotoPath);
        }

        return back();
    }

    protected function resolveDashboardRouteFor(User $user): string
    {
        return match ($user->role) {
            'resort_admin' => 'resort-admin.dashboard',
            'hotel_admin' => 'hotel-admin.dashboard',
            'super_admin' => 'super-admin.dashboard',
            'municipality_admin' => 'municipality-admin.dashboard',
            default => 'dashboard',
        };
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
