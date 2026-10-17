<?php

namespace App\Http\Controllers;

use App\Models\AccountSecurityEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountSecurityHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User && $user->role === 'super_admin', 403);

        $filters = $request->validate([
            'action' => ['nullable', Rule::in([
                'account_disabled',
                'account_enabled',
                'account_created',
                'account_edited',
                'role_changed',
                'report_submitted',
                'report_reviewed',
                'report_resolved',
            ])],
        ]);

        return Inertia::render('SuperAdmin/Accounts/SecurityHistory', [
            'events' => AccountSecurityEvent::query()
                ->with(['actor:id,name', 'targetUser:id,name,email', 'scamReport:id,reported_account'])
                ->when(
                    filled($filters['action'] ?? null),
                    fn ($query) => $query->where('action', $filters['action']),
                )
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->paginate(20)
                ->withQueryString(),
            'actions' => [
                'account_disabled',
                'account_enabled',
                'account_created',
                'account_edited',
                'role_changed',
                'report_submitted',
                'report_reviewed',
                'report_resolved',
            ],
            'filter' => $filters['action'] ?? '',
        ]);
    }
}
