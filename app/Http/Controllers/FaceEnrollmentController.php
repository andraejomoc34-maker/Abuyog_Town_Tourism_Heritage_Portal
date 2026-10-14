<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FaceIdentityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FaceEnrollmentController extends Controller
{
    public function destroy(Request $request, FaceIdentityService $faceIdentity): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->role === 'user', 403);

        try {
            $removed = $faceIdentity->removeEnrollment($user);
        } catch (\Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'face_enrollment' => 'Your face data could not be removed right now. Please try again later.',
            ]);
        }

        if (! $removed) {
            return back()->withErrors([
                'face_enrollment' => 'No face data is enrolled for this account.',
            ]);
        }

        return back()->with('success', 'Your face data has been removed.');
    }
}
