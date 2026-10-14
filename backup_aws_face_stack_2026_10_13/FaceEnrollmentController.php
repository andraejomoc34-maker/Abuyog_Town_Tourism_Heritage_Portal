<?php

namespace App\Http\Controllers;

use App\Exceptions\DuplicateFaceIdentityException;
use App\Exceptions\UncertainFaceIdentityException;
use App\Models\User;
use App\Services\FaceIdentityService;
use App\Services\FaceLivenessService;
use App\Services\FaceRecognitionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FaceEnrollmentController extends Controller
{
    public function createSession(
        Request $request,
        FaceLivenessService $faceLiveness,
        FaceRecognitionService $faceRecognition,
    ): RedirectResponse {
        $user = $this->customer($request);
        $request->validate(['consent' => ['accepted']]);

        if ($user->faceIdentity()->exists()) {
            return back()->withErrors([
                'face_enrollment' => 'A face identity is already enrolled for this account.',
            ]);
        }

        if (! $faceLiveness->hasBrowserConfiguration() || ! $faceRecognition->isConfigured()) {
            return back()->withErrors([
                'face_enrollment' => 'Face enrollment is currently unavailable. Please try again later.',
            ]);
        }

        try {
            $sessionId = $faceLiveness->createSession();
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_enrollment' => 'Face enrollment is currently unavailable. Please try again later.',
            ]);
        }

        $request->session()->put('profile.face_liveness', [
            'session_id' => $sessionId,
            'expires_at' => now()->addSeconds(175)->timestamp,
            'consent' => true,
        ]);

        return back();
    }

    public function complete(
        Request $request,
        FaceLivenessService $faceLiveness,
        FaceIdentityService $faceIdentity,
    ): RedirectResponse {
        $user = $this->customer($request);
        $verification = $request->session()->get('profile.face_liveness');
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        if (! is_string($sessionId)
            || ! is_numeric($verification['expires_at'] ?? null)
            || now()->timestamp > (int) $verification['expires_at']
            || ($verification['consent'] ?? false) !== true) {
            $request->session()->forget('profile.face_liveness');

            return back()->withErrors([
                'face_enrollment' => 'Enrollment expired. Please start again.',
            ]);
        }

        try {
            $faceLiveness->storeVerifiedReferenceImage($sessionId);
            $referenceImage = $faceLiveness->consumeVerifiedReferenceImage($sessionId);

            if ($referenceImage === null) {
                throw new \RuntimeException('Amazon Rekognition did not return a verified reference image.');
            }

            if (! $faceIdentity->enrollExistingUser($user, $referenceImage)) {
                $request->session()->forget('profile.face_liveness');

                return back()->withErrors([
                    'face_enrollment' => 'A face identity is already enrolled for this account.',
                ]);
            }
        } catch (DuplicateFaceIdentityException) {
            $request->session()->forget('profile.face_liveness');

            return back()->withErrors([
                'face_enrollment' => 'This face is associated with an existing account. Please contact the site administrator for assistance.',
            ]);
        } catch (UncertainFaceIdentityException) {
            $request->session()->forget('profile.face_liveness');

            return back()->withErrors([
                'face_enrollment' => 'We could not confidently verify this face. Please contact the site administrator for assistance.',
            ]);
        } catch (\Throwable $exception) {
            report($exception);
            $request->session()->forget('profile.face_liveness');

            return back()->withErrors([
                'face_enrollment' => 'Face enrollment is currently unavailable. Please try again later.',
            ]);
        }

        $request->session()->forget('profile.face_liveness');

        return back()->with('success', 'Your face identity has been enrolled.');
    }

    public function cancel(Request $request, FaceLivenessService $faceLiveness): RedirectResponse
    {
        $verification = $request->session()->get('profile.face_liveness');
        $sessionId = is_array($verification) ? ($verification['session_id'] ?? null) : null;

        if (is_string($sessionId)) {
            $faceLiveness->forgetVerifiedReferenceImage($sessionId);
        }

        $request->session()->forget('profile.face_liveness');

        return back();
    }

    public function destroy(Request $request, FaceIdentityService $faceIdentity): RedirectResponse
    {
        $user = $this->customer($request);

        try {
            $removed = $faceIdentity->removeEnrollment($user);
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_enrollment' => 'Your face identity could not be removed right now. Please try again later.',
            ]);
        }

        if (! $removed) {
            return back()->withErrors([
                'face_enrollment' => 'No face identity is enrolled for this account.',
            ]);
        }

        return back()->with('success', 'Your face identity has been removed.');
    }

    private function customer(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->role === 'user', 403);

        return $user;
    }
}
