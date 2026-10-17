<?php

use App\Models\AccountSecurityEvent;
use App\Models\Resort;
use App\Models\ScamReport;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

it('shows permitted users with actual summaries and supports role status search and registration sorting', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $older = User::factory()->create([
        'name' => 'Older searchable visitor',
        'email' => 'older.visitor@example.test',
        'created_at' => now()->subDays(10),
    ]);
    $newer = User::factory()->create([
        'name' => 'Newer searchable visitor',
        'email' => 'newer.visitor@example.test',
        'created_at' => now()->subDay(),
        'is_active' => false,
        'disabled_reason' => 'Suspended during investigation.',
    ]);
    User::factory()->create(['role' => 'hotel_admin']);

    $this->actingAs($admin)
        ->get(route('super-admin.accounts.index', [
            'search' => 'searchable',
            'role' => 'user',
            'status' => 'disabled',
            'date_order' => 'oldest',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('SuperAdmin/Accounts/Index')
            ->has('accounts.data', 1)
            ->where('accounts.data.0.id', $newer->id)
            ->where('accounts.data.0.disabled_reason', 'Suspended during investigation.')
            ->where('statistics.total', 2)
            ->where('statistics.active', 1)
            ->where('statistics.disabled', 1)
            ->where('statistics.new', 2)
            ->where('filters.date_order', 'oldest'));

    expect($older->id)->not->toBe($newer->id);
});

it('sorts registered accounts and paginates results on the server', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $accounts = collect(range(1, 17))->map(function (int $index): User {
        return User::factory()->create([
            'name' => "Pagination visitor {$index}",
            'created_at' => now()->subDays($index),
        ]);
    });

    $this->actingAs($admin)
        ->get(route('super-admin.accounts.index', ['date_order' => 'oldest']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('accounts.data', 15)
            ->where('accounts.total', 17)
            ->where('accounts.data.0.id', $accounts->last()->id));

    $this->actingAs($admin)
        ->get(route('super-admin.accounts.index', ['date_order' => 'oldest', 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('accounts.data', 2)
            ->where('accounts.total', 17));
});

it('requires a reason to disable an eligible account and records suspension and reactivation history', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $target = User::factory()->create(['role' => 'user']);
    $originalRememberToken = $target->remember_token;

    config(['session.driver' => 'database']);
    DB::table('sessions')->insert([
        'id' => 'suspended-user-session',
        'user_id' => $target->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Security test',
        'payload' => 'serialized-session-data',
        'last_activity' => now()->timestamp,
    ]);
    $this->actingAs($admin)
        ->patch(route('super-admin.accounts.status', $target), ['is_active' => false])
        ->assertSessionHasErrors('reason');
    expect($target->fresh()->is_active)->toBeTrue();

    $this->actingAs($admin)
        ->patch(route('super-admin.accounts.status', $target), [
            'is_active' => false,
            'reason' => 'Suspected fraudulent bookings',
        ])
        ->assertRedirect();

    $target->refresh();
    expect($target->is_active)->toBeFalse()
        ->and($target->disabled_reason)->toBe('Suspected fraudulent bookings')
        ->and($target->disabled_by)->toBe($admin->id)
        ->and($target->disabled_at)->not->toBeNull()
        ->and($target->remember_token)->not->toBe($originalRememberToken)
        ->and($target->role)->toBe('user');
    $this->assertDatabaseMissing('sessions', ['id' => 'suspended-user-session']);

    auth()->logout();
    $this->post(route('login.store'), [
        'email' => $target->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->actingAs($admin)
        ->patch(route('super-admin.accounts.status', $target), ['is_active' => true])
        ->assertRedirect();

    expect($target->fresh()->is_active)->toBeTrue()
        ->and($target->fresh()->disabled_reason)->toBeNull()
        ->and($target->fresh()->role)->toBe('user')
        ->and(AccountSecurityEvent::query()->where('target_user_id', $target->id)->pluck('action')->all())
        ->toBe(['account_disabled', 'account_enabled']);
});

it('forces a disabled user with an existing authenticated session out before protected actions', function () {
    $target = User::factory()->create(['role' => 'user']);
    $resort = Resort::query()->create(['name' => 'Session security resort', 'status' => 'active']);
    $this->actingAs($target);

    DB::table('users')->where('id', $target->id)->update([
        'is_active' => false,
        'disabled_reason' => 'Repeated abusive submissions',
    ]);

    $this->get(route('profile'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');

    $this->post(route('resorts.book.store', $resort), [])
        ->assertRedirect(route('login'));

    $this->actingAs($target)
        ->post(route('feedback.store'), [
            'name' => $target->name,
            'email' => $target->email,
            'rating' => 5,
            'message' => 'A feedback submission blocked for this disabled account.',
        ])
        ->assertRedirect(route('login'));
    $this->assertDatabaseCount('feedback', 0);

    $this->actingAs($target)
        ->post(route('resorts.inquire.store', $resort), [
            'name' => $target->name,
            'email' => $target->email,
            'message' => 'An inquiry submission blocked for this disabled account.',
        ])
        ->assertRedirect(route('login'));
    $this->assertDatabaseCount('inquiries', 0);

    $this->assertDatabaseCount('bookings', 0);
    $this->assertGuest();
});

it('does not let non-super-admins manage users or protected super-administrator accounts', function () {
    $visitor = User::factory()->create(['role' => 'user']);
    $resortAdmin = User::factory()->create(['role' => 'resort_admin']);
    $superAdmin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($visitor)
        ->get(route('super-admin.accounts.index'))
        ->assertForbidden();
    $this->actingAs($resortAdmin)
        ->patch(route('super-admin.accounts.status', $visitor), [
            'is_active' => false,
            'reason' => 'Suspected fraudulent bookings',
        ])
        ->assertForbidden();
    $this->actingAs($superAdmin)
        ->patch(route('super-admin.accounts.status', $superAdmin), [
            'is_active' => false,
            'reason' => 'Attempted scams or deceptive activity',
        ])
        ->assertNotFound();

    expect($superAdmin->fresh()->is_active)->toBeTrue();
});

it('records permitted account detail and role edits without recording passwords', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $target = User::factory()->create(['role' => 'user']);
    $resort = Resort::query()->create(['name' => 'Assigned resort', 'status' => 'active']);

    $this->actingAs($admin)
        ->put(route('super-admin.accounts.update', $target), [
            'name' => 'Updated visitor',
            'email' => $target->email,
            'role' => 'resort_admin',
            'resort_id' => $resort->id,
            'password' => '',
        ])
        ->assertRedirect(route('super-admin.accounts.index'));

    $event = AccountSecurityEvent::query()->where('target_user_id', $target->id)->firstOrFail();
    expect($event->actor_id)->toBe($admin->id)
        ->and($event->action)->toBe('role_changed')
        ->and($event->details['changed_fields'])->toContain('role', 'resort_id')
        ->and(json_encode($event->details))->not->toContain('password');
});

it('records account creation without recording credential values', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->post(route('super-admin.accounts.store'), [
            'name' => 'New portal visitor',
            'email' => 'new.portal.visitor@example.test',
            'role' => 'user',
            'password' => 'Secret-Password-123',
        ])
        ->assertRedirect(route('super-admin.accounts.index'));

    $target = User::query()->where('email', 'new.portal.visitor@example.test')->firstOrFail();
    $event = AccountSecurityEvent::query()->where('target_user_id', $target->id)->firstOrFail();
    expect($event->actor_id)->toBe($admin->id)
        ->and($event->action)->toBe('account_created')
        ->and(json_encode($event->getAttributes()))->not->toContain('Secret-Password-123');
});

it('accepts private scam reports, rate limits submissions, and restricts report review to super administrators', function () {
    $reporter = User::factory()->create(['role' => 'user']);
    $payload = [
        'reported_account' => 'possibly-fraudulent@example.test',
        'reason' => 'fraudulent_bookings',
        'description' => 'The account requested payment outside the portal and then stopped responding.',
        'activity_reference' => 'Inquiry reference #A-101',
    ];

    $this->actingAs($reporter)
        ->post(route('account-concern.store'), $payload)
        ->assertRedirect(route('account-concern.create'));

    $report = ScamReport::query()->firstOrFail();
    expect($report->reporter_user_id)->toBe($reporter->id)
        ->and($report->status)->toBe('pending')
        ->and($report->review_notes)->toBeNull();

    $this->actingAs($reporter)
        ->get(route('super-admin.accounts.reports'))
        ->assertForbidden();
    $this->actingAs(User::factory()->create(['role' => 'municipality_admin']))
        ->patch(route('super-admin.accounts.reports.review', $report), [
            'status' => 'investigated',
            'review_notes' => 'Reviewed and documented.',
        ])
        ->assertForbidden();

    $admin = User::factory()->create(['role' => 'super_admin']);
    $this->actingAs($admin)
        ->patch(route('super-admin.accounts.reports.review', $report), [
            'status' => 'investigated',
            'review_notes' => 'Reviewed and documented.',
        ])
        ->assertRedirect();

    expect($report->fresh()->status)->toBe('investigated')
        ->and($report->fresh()->reviewed_by)->toBe($admin->id)
        ->and($report->fresh()->reviewed_at)->not->toBeNull()
        ->and(AccountSecurityEvent::query()->where('scam_report_id', $report->id)->pluck('action')->all())
        ->toContain('report_submitted', 'report_reviewed');

    $this->actingAs($admin)
        ->get(route('super-admin.accounts.security-history'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('SuperAdmin/Accounts/SecurityHistory')
            ->where('events.data.0.action', 'report_reviewed'));

    $this->assertDatabaseHas('users', [
        'id' => $reporter->id,
        'is_active' => true,
    ]);

    auth()->logout();
    foreach (range(1, 3) as $index) {
        $this->post(route('account-concern.store'), [
            ...$payload,
            'reported_account' => "reported-account-{$index}",
        ])->assertRedirect(route('account-concern.create'));
    }
    $this->post(route('account-concern.store'), $payload)->assertTooManyRequests();
});

it('validates report reasons and restricts audit history to super administrators', function () {
    $this->post(route('account-concern.store'), [
        'reported_account' => 'account@example.test',
        'reason' => 'confirmed_scam',
        'description' => 'This text is long enough to satisfy the minimum description size.',
    ])->assertSessionHasErrors('reason');

    $this->get(route('super-admin.accounts.security-history'))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('super-admin.accounts.security-history'))
        ->assertForbidden();
});
