<?php

namespace App\Http\Controllers;

use App\Models\AccountSecurityEvent;
use App\Models\Resort;
use App\Models\User;
use App\Services\ResortAdminNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccountController extends Controller
{
    private const MANAGEABLE_ROLES = ['user', 'municipality_admin', 'resort_admin'];

    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', Rule::in(self::MANAGEABLE_ROLES)],
            'status' => ['nullable', Rule::in(['active', 'disabled'])],
            'date_order' => ['nullable', Rule::in(['newest', 'oldest'])],
        ]);
        $manageableUsers = User::query()->whereIn('role', self::MANAGEABLE_ROLES);
        $query = (clone $manageableUsers)
            ->select(['id', 'name', 'email', 'role', 'resort_id', 'is_active'])
            ->addSelect(['created_at', 'disabled_reason', 'disabled_at'])
            ->with('resort:id,name');

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        if (filled($filters['role'] ?? null)) {
            $query->where('role', $filters['role']);
        }

        if (($filters['status'] ?? null) === 'active') {
            $query->where('is_active', true);
        } elseif (($filters['status'] ?? null) === 'disabled') {
            $query->where('is_active', false);
        }

        $statistics = [
            'total' => (clone $manageableUsers)->count(),
            'active' => (clone $manageableUsers)->where('is_active', true)->count(),
            'disabled' => (clone $manageableUsers)->where('is_active', false)->count(),
            'new' => (clone $manageableUsers)->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('SuperAdmin/Accounts/Index', [
            'accounts' => $query
                ->orderBy('created_at', ($filters['date_order'] ?? 'newest') === 'oldest' ? 'asc' : 'desc')
                ->paginate(15)
                ->withQueryString(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role' => $filters['role'] ?? '',
                'status' => $filters['status'] ?? '',
                'date_order' => $filters['date_order'] ?? 'newest',
            ],
            'statistics' => $statistics,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        return $this->form();
    }

    public function store(Request $request, ResortAdminNotifier $notifier): RedirectResponse
    {
        $actor = $this->authorizeSuperAdmin($request);
        $validated = $request->validate($this->rules());
        $validated['resort_id'] = $validated['role'] === 'resort_admin'
            ? $validated['resort_id']
            : null;
        $validated['is_active'] = true;

        $account = DB::transaction(function () use ($actor, $validated): User {
            $account = User::query()->create($validated);
            AccountSecurityEvent::query()->create([
                'actor_id' => $actor->id,
                'target_user_id' => $account->id,
                'action' => 'account_created',
                'reason' => 'Account created with role '.$account->role.'.',
                'details' => ['role' => $account->role],
            ]);

            return $account;
        });

        $notificationTitle = match ($account->role) {
            'user' => 'Visitor account created',
            default => 'Administrator account created',
        };
        $notificationMessage = match ($account->role) {
            'user' => 'A visitor account was created.',
            'resort_admin' => 'A resort administrator account was created.',
            default => 'A municipality administrator account was created.',
        };

        $notifier->notifySuperAdmins(
            $notificationTitle,
            $notificationMessage,
            '/super-admin/accounts',
            'admin_account',
            $actor->id,
        );

        return redirect()->route('super-admin.accounts.index')->with('success', 'Account created.');
    }

    public function edit(Request $request, User $user): Response
    {
        $this->authorizeSuperAdmin($request);
        $this->ensureManageable($user);

        return $this->form([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'resort_id' => $user->resort_id,
            'is_active' => $user->is_active,
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $actor = $this->authorizeSuperAdmin($request);
        $this->ensureManageable($user);
        $validated = $request->validate($this->rules($user));
        $passwordChanged = filled($validated['password'] ?? null);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $validated['resort_id'] = $validated['role'] === 'resort_admin'
            ? $validated['resort_id']
            : null;
        unset($validated['is_active']);

        DB::transaction(function () use ($actor, $user, $validated, $passwordChanged): void {
            $target = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->ensureManageable($target);
            $before = [
                'name' => $target->name,
                'email' => $target->email,
                'role' => $target->role,
                'resort_id' => $target->resort_id,
            ];
            $target->update($validated);
            $after = [
                'name' => $target->name,
                'email' => $target->email,
                'role' => $target->role,
                'resort_id' => $target->resort_id,
            ];
            $changed = array_keys(array_filter(
                $after,
                static fn (mixed $value, string $field): bool => $value !== $before[$field],
                ARRAY_FILTER_USE_BOTH,
            ));
            if ($passwordChanged) {
                $changed[] = 'password_changed';
            }

            if ($changed !== []) {
                AccountSecurityEvent::query()->create([
                    'actor_id' => $actor->id,
                    'target_user_id' => $target->id,
                    'action' => $before['role'] !== $after['role'] ? 'role_changed' : 'account_edited',
                    'reason' => 'Account fields changed: '.implode(', ', $changed),
                    'details' => [
                        'changed_fields' => $changed,
                        'old_role' => $before['role'] !== $after['role'] ? $before['role'] : null,
                        'new_role' => $before['role'] !== $after['role'] ? $after['role'] : null,
                    ],
                ]);
            }
        });

        return redirect()->route('super-admin.accounts.index')->with('success', 'Account updated.');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $actor = $this->authorizeSuperAdmin($request);
        $this->ensureManageable($user);
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
            'reason' => [Rule::requiredIf(! $request->boolean('is_active')), 'nullable', 'string', 'min:10', 'max:1000'],
        ]);

        $isActive = (bool) $validated['is_active'];
        $reason = $isActive ? null : trim((string) $validated['reason']);

        DB::transaction(function () use ($actor, $user, $isActive, $reason): void {
            $target = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->ensureManageable($target);

            if ($target->is_active === $isActive) {
                return;
            }

            if ($isActive) {
                $target->update([
                    'is_active' => true,
                    'disabled_reason' => null,
                    'disabled_by' => null,
                    'disabled_at' => null,
                ]);
                $action = 'account_enabled';
                $eventReason = 'Account re-enabled; prior suspension details remain in the security history.';
            } else {
                $target->forceFill([
                    'is_active' => false,
                    'disabled_reason' => $reason,
                    'disabled_by' => $actor->id,
                    'disabled_at' => now(),
                    'remember_token' => Str::random(60),
                ])->save();
                $action = 'account_disabled';
                $eventReason = $reason;
            }

            AccountSecurityEvent::query()->create([
                'actor_id' => $actor->id,
                'target_user_id' => $target->id,
                'action' => $action,
                'reason' => $eventReason,
            ]);
        });

        if (! $isActive && config('session.driver') === 'database' && Schema::hasTable(config('session.table', 'sessions'))) {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }

        return back()->with(
            'success',
            $isActive
                ? 'Account enabled.'
                : 'Account disabled. Existing sessions are blocked on their next request.',
        );
    }

    private function form(?array $account = null): Response
    {
        return Inertia::render('SuperAdmin/Accounts/Form', [
            'account' => $account,
            'roles' => self::MANAGEABLE_ROLES,
            'resorts' => Resort::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    private function rules(?User $user = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'role' => ['required', Rule::in(self::MANAGEABLE_ROLES)],
            'resort_id' => ['nullable', 'required_if:role,resort_admin', 'exists:resorts,id'],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
        ];
    }

    private function authorizeSuperAdmin(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->role === 'super_admin', 403);

        return $user;
    }

    private function ensureManageable(User $user): void
    {
        abort_unless(in_array($user->role, self::MANAGEABLE_ROLES, true), 404);
    }
}
