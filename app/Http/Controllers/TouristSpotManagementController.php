<?php

namespace App\Http\Controllers;

use App\Models\TouristSpot;
use App\Models\User;
use App\Services\ContentChangeLogger;
use App\Services\ContentImageManager;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TouristSpotManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeMunicipalStaff($request);
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'Archived'])],
            'category' => ['nullable', 'string', 'max:100'],
        ]);
        $query = TouristSpot::query()->with('images');

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $builder) use ($search): void {
                $builder->where('name', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('location', 'like', '%'.$search.'%')
                    ->orWhere('category', 'like', '%'.$search.'%');
            });
        }

        if (filled($filters['status'] ?? null)) {
            $query->where('status', $filters['status']);
        }

        if (filled($filters['category'] ?? null)) {
            $query->where('category', $filters['category']);
        }

        return Inertia::render('Municipality/TouristSpots/Index', [
            'spots' => $query->orderBy('name')->paginate(15)->withQueryString()->through(
                fn (TouristSpot $spot): array => [
                    'id' => $spot->id,
                    'name' => $spot->name,
                    'description' => $spot->description,
                    'location' => $spot->location,
                    'category' => $spot->category,
                    'imageUrl' => $spot->image_url,
                    'status' => $spot->status,
                    'images' => $spot->images->map(fn ($image): array => [
                        'id' => $image->id,
                        'url' => $image->url,
                    ])->all(),
                ],
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? '',
                'category' => $filters['category'] ?? '',
            ],
            'categories' => TouristSpot::query()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeMunicipalStaff($request);

        return Inertia::render('Municipality/TouristSpots/Form', [
            'spot' => null,
            'categories' => TouristSpot::query()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function store(
        Request $request,
        ContentImageManager $imageManager,
        ContentChangeLogger $history,
    ): RedirectResponse {
        $actor = $this->authorizeMunicipalStaff($request);
        $validated = $request->validate($this->rules());
        $images = $validated['images'] ?? [];
        unset($validated['images'], $validated['remove_image_ids'], $validated['remove_primary_image']);

        $imageManager->transaction(function (ContentImageManager $manager) use ($validated, $images, $history, $actor): void {
            $spot = TouristSpot::query()->create($validated);
            $manager->sync($spot, $images, []);
            $history->record($actor, $spot, 'created', null, $history->snapshot($spot));
        });

        return redirect()->route('municipality-admin.tourist-spots')->with('success', 'Tourist destination created.');
    }

    public function edit(Request $request, TouristSpot $touristSpot): Response
    {
        $this->authorizeMunicipalStaff($request);

        return Inertia::render('Municipality/TouristSpots/Form', [
            'spot' => [
                'id' => $touristSpot->id,
                'name' => $touristSpot->name,
                'description' => $touristSpot->description,
                'location' => $touristSpot->location,
                'category' => $touristSpot->category,
                'imageUrl' => $touristSpot->image_url,
                'status' => $touristSpot->status,
                'images' => $touristSpot->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'url' => $image->url,
                ])->all(),
            ],
            'categories' => TouristSpot::query()->whereNotNull('category')->distinct()->orderBy('category')->pluck('category'),
        ]);
    }

    public function update(
        Request $request,
        TouristSpot $touristSpot,
        ContentImageManager $imageManager,
        ContentChangeLogger $history,
    ): RedirectResponse {
        $actor = $this->authorizeMunicipalStaff($request);
        $validated = $request->validate($this->rules());
        $images = $validated['images'] ?? [];
        $removeIds = $validated['remove_image_ids'] ?? [];
        $removePrimaryImage = (bool) ($validated['remove_primary_image'] ?? false);
        unset($validated['images'], $validated['remove_image_ids'], $validated['remove_primary_image']);

        $imageManager->transaction(function (ContentImageManager $manager) use ($touristSpot, $validated, $images, $removeIds, $removePrimaryImage, $history, $actor): void {
            $before = $history->snapshot($touristSpot);

            if ($removePrimaryImage) {
                $validated['image_url'] = null;
            }

            $touristSpot->update($validated);
            $manager->sync($touristSpot, $images, $removeIds);
            $history->record($actor, $touristSpot, 'edited', $before, $history->snapshot($touristSpot));
        });

        return redirect()->route('municipality-admin.tourist-spots')->with('success', 'Tourist destination updated.');
    }

    public function updateStatus(
        Request $request,
        TouristSpot $touristSpot,
        ContentChangeLogger $history,
    ): RedirectResponse {
        $actor = $this->authorizeMunicipalStaff($request);
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'inactive', 'Archived'])],
        ]);
        DB::transaction(function () use ($touristSpot, $validated, $history, $actor): void {
            $before = $history->snapshot($touristSpot);
            $touristSpot->update(['status' => $validated['status']]);
            $history->record($actor, $touristSpot, $validated['status'] === 'Archived' ? 'archived' : 'status_changed', $before, $history->snapshot($touristSpot));
        });

        return back()->with('success', 'Tourist destination status updated.');
    }

    public function restore(Request $request, TouristSpot $touristSpot, ContentChangeLogger $history): RedirectResponse
    {
        $actor = $this->authorizeMunicipalStaff($request);
        abort_unless($touristSpot->status === 'Archived', 404);

        DB::transaction(function () use ($touristSpot, $history, $actor): void {
            $before = $history->snapshot($touristSpot);
            $touristSpot->update(['status' => 'inactive']);
            $history->record($actor, $touristSpot, 'restored', $before, $history->snapshot($touristSpot));
        });

        return back()->with('success', 'Tourist destination restored as inactive. Publish it when it is ready for visitors.');
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'location' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'image_url' => [
                'nullable',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (! is_string($value)) {
                        return;
                    }

                    $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));
                    $isSafeRemoteUrl = in_array($scheme, ['http', 'https'], true)
                        && filter_var($value, FILTER_VALIDATE_URL) !== false;
                    $isSafeLocalPath = ! str_contains($value, ':')
                        && ! str_contains($value, '\\')
                        && ! str_starts_with($value, '//')
                        && ! in_array('..', explode('/', $value), true);

                    if (! $isSafeRemoteUrl && ! $isSafeLocalPath) {
                        $fail('Enter a valid HTTPS/HTTP image URL or local image path.');
                    }
                },
            ],
            'status' => ['required', Rule::in(['active', 'inactive', 'Archived'])],
            ...ContentImageManager::validationRules(),
        ];
    }

    private function authorizeMunicipalStaff(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User && in_array($user->role, ['municipality_admin', 'super_admin'], true), 403);

        return $user;
    }
}
