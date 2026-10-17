<?php

namespace App\Http\Controllers;

use App\Models\AccountSecurityEvent;
use App\Models\ScamReport;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ScamReportController extends Controller
{
    private const STATUSES = ['pending', 'under_review', 'investigated', 'resolved'];

    private const REASONS = [
        'fraudulent_bookings',
        'deceptive_activity',
        'abusive_submissions',
        'spam_or_misuse',
        'other',
    ];

    public function create(): Response
    {
        return Inertia::render('auth/ReportConcern', [
            'reasons' => self::REASONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reported_account' => ['required', 'string', 'max:255'],
            'reason' => ['required', Rule::in(self::REASONS)],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'activity_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $report = ScamReport::query()->create([
            ...$validated,
            'reported_account' => trim($validated['reported_account']),
            'description' => trim($validated['description']),
            'activity_reference' => filled($validated['activity_reference'] ?? null)
                ? trim($validated['activity_reference'])
                : null,
            'reporter_user_id' => $request->user()?->id,
        ]);

        AccountSecurityEvent::query()->create([
            'actor_id' => $request->user()?->id,
            'scam_report_id' => $report->id,
            'action' => 'report_submitted',
            'reason' => 'A visitor submitted an allegation for review.',
        ]);

        return redirect()->route('account-concern.create')
            ->with('success', 'Your report was submitted for review. Reports are investigated before any account action is taken.');
    }

    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        $filters = $request->validate([
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $reports = ScamReport::query()
            ->when(
                filled($filters['status'] ?? null),
                fn ($query) => $query->where('status', $filters['status']),
            )
            ->when(filled($filters['search'] ?? null), function ($query) use ($filters): void {
                $search = trim($filters['search']);
                $query->where(function ($builder) use ($search): void {
                    $builder->where('reported_account', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%')
                        ->orWhere('activity_reference', 'like', '%'.$search.'%');
                });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/Accounts/Reports', [
            'reports' => $reports,
            'filters' => [
                'status' => $filters['status'] ?? '',
                'search' => $filters['search'] ?? '',
            ],
            'statuses' => self::STATUSES,
        ]);
    }

    public function review(Request $request, ScamReport $scamReport): RedirectResponse
    {
        $actor = $this->authorizeSuperAdmin($request);
        $validated = $request->validate([
            'status' => ['required', Rule::in(self::STATUSES)],
            'review_notes' => ['required', 'string', 'min:3', 'max:3000'],
        ]);

        DB::transaction(function () use ($actor, $scamReport, $validated): void {
            $report = ScamReport::query()->lockForUpdate()->findOrFail($scamReport->id);
            $oldStatus = $report->status;
            $report->update([
                'status' => $validated['status'],
                'review_notes' => trim($validated['review_notes']),
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
            ]);

            $targetUser = User::query()
                ->whereIn('role', ['user', 'municipality_admin', 'resort_admin'])
                ->where(function ($query) use ($report): void {
                    $query->whereRaw('LOWER(email) = ?', [strtolower($report->reported_account)])
                        ->orWhereRaw('LOWER(name) = ?', [strtolower($report->reported_account)]);
                })
                ->first();

            AccountSecurityEvent::query()->create([
                'actor_id' => $actor->id,
                'target_user_id' => $targetUser?->id,
                'scam_report_id' => $report->id,
                'action' => $validated['status'] === 'resolved' ? 'report_resolved' : 'report_reviewed',
                'reason' => 'Report status changed from '.$oldStatus.' to '.$report->status.'.',
                'details' => [
                    'old_status' => $oldStatus,
                    'new_status' => $report->status,
                ],
            ]);
        });

        return back()->with('success', 'Report review saved. No account was automatically disabled.');
    }

    private function authorizeSuperAdmin(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'super_admin', 403);

        return $user;
    }
}
