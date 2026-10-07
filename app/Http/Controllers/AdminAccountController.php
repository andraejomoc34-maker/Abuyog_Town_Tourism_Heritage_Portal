<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminAccountController extends Controller
{
    private const MANAGEABLE_ROLES = ['municipality_admin', 'resort_admin'];

    public function index(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        return Inertia::render('SuperAdmin/Accounts/Index', [
            'accounts' => User::query()
                ->with('resort:id,name')
                ->whereIn('role', self::MANAGEABLE_ROLES)
                ->orderBy('role')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'resort_id', 'is_active']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeSuperAdmin($request);

        return $this->form();
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperAdmin($request);
        $validated = $request->validate($this->rules());
        $validated['resort_id'] = $validated['role'] === 'resort_admin'
            ? $validated['resort_id']
            : null;
        $validated['is_active'] = true;

        User::create($validated);

        return redirect()->route('super-admin.accounts.index')->with('success', 'Admin account created.');
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
        $this->authorizeSuperAdmin($request);
        $this->ensureManageable($user);
        $validated = $request->validate($this->rules($user));

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $validated['resort_id'] = $validated['role'] === 'resort_admin'
            ? $validated['resort_id']
            : null;
        unset($validated['is_active']);

        $user->update($validated);

        return redirect()->route('super-admin.accounts.index')->with('success', 'Admin account updated.');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $this->authorizeSuperAdmin($request);
        $this->ensureManageable($user);
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update(['is_active' => $validated['is_active']]);

        return back()->with('success', $validated['is_active'] ? 'Admin account enabled.' : 'Admin account disabled.');
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
