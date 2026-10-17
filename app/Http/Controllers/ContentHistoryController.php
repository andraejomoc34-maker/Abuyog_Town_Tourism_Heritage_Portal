<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\ContentChange;
use App\Models\Resort;
use App\Models\TouristSpot;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContentHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User && in_array($user->role, [
            'super_admin',
            'municipality_admin',
            'resort_admin',
            'hotel_admin',
        ], true), 403);

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'content_type' => ['nullable', Rule::in([
                Announcement::class,
                TouristSpot::class,
                Resort::class,
            ])],
            'action' => ['nullable', Rule::in(['created', 'edited', 'published', 'unpublished', 'archived', 'restored', 'status_changed', 'deleted'])],
        ]);

        $query = ContentChange::query()->with('user:id,name');
        $this->applyRoleScope($query, $user);

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where('description', 'like', '%'.$search.'%');
        }

        if (filled($filters['content_type'] ?? null)) {
            $query->where('content_type', $filters['content_type']);
        }

        if (filled($filters['action'] ?? null)) {
            $query->where('action', $filters['action']);
        }

        return Inertia::render('Municipality/ContentHistory/Index', [
            'changes' => $query->latest()->paginate(20)->withQueryString()->through(
                fn (ContentChange $change): array => [
                    'id' => $change->id,
                    'content_type' => $change->content_type,
                    'content_id' => $change->content_id,
                    'action' => $change->action,
                    'description' => $change->description,
                    'before' => $change->before_values,
                    'after' => $change->after_values,
                    'created_at' => $change->created_at?->toIso8601String(),
                    'user' => $change->user
                        ? ['id' => $change->user->id, 'name' => $change->user->name]
                        : null,
                ],
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'content_type' => $filters['content_type'] ?? '',
                'action' => $filters['action'] ?? '',
            ],
            'contentTypes' => [Announcement::class, TouristSpot::class, Resort::class],
            'canViewAll' => in_array($user->role, ['super_admin', 'municipality_admin'], true),
        ]);
    }

    private function applyRoleScope(Builder $query, User $user): void
    {
        if ($user->role === 'super_admin') {
            return;
        }

        if ($user->role === 'municipality_admin') {
            $query->where(function (Builder $builder): void {
                $builder->where('content_type', TouristSpot::class)
                    ->orWhere(function (Builder $announcementQuery): void {
                        $announcementQuery->where('content_type', Announcement::class)
                            ->whereIn('content_id', Announcement::query()->whereNull('resort_id')->select('id'));
                    });
            });

            return;
        }

        $resortId = $user->resort_id;

        if ($user->role === 'hotel_admin') {
            $resortId = Resort::query()->where('property_code', 'abuyog-hotel')->value('id');
        }

        abort_unless($resortId, 403);
        $query->where(function (Builder $builder) use ($resortId): void {
            $builder->where(function (Builder $resortQuery) use ($resortId): void {
                $resortQuery->where('content_type', Resort::class)->where('content_id', $resortId);
            })->orWhere(function (Builder $announcementQuery) use ($resortId): void {
                $announcementQuery->where('content_type', Announcement::class)
                    ->whereIn('content_id', Announcement::query()->where('resort_id', $resortId)->select('id'));
            });
        });
    }
}
