<?php

namespace App\Services;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class ContentImageManager
{
    private array $newPaths = [];

    private array $removedPaths = [];

    public static function validationRules(): array
    {
        $maxKilobytes = (int) config('tourism.image_upload.max_kilobytes', 5120);
        $maxFiles = (int) config('tourism.image_upload.max_files', 10);

        return [
            'images' => ['sometimes', 'array', 'max:'.$maxFiles],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:'.$maxKilobytes],
            'remove_image_ids' => ['sometimes', 'array', 'max:'.$maxFiles],
            'remove_image_ids.*' => ['required', 'integer', 'distinct'],
        ];
    }

    public function transaction(Closure $callback): mixed
    {
        $this->newPaths = [];
        $this->removedPaths = [];

        try {
            $result = DB::transaction(fn (): mixed => $callback($this));
        } catch (Throwable $exception) {
            $this->deletePaths($this->newPaths);
            throw $exception;
        }

        $this->deletePaths($this->removedPaths);

        return $result;
    }

    public function store(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');

        if (! is_string($path)) {
            throw ValidationException::withMessages([
                'images' => 'One or more images could not be stored. Please try again.',
            ]);
        }

        $this->newPaths[] = $path;

        return $path;
    }

    /**
     * @param  array<int, UploadedFile>  $files
     * @param  array<int, int|string>  $removeIds
     */
    public function sync(Model $owner, array $files, array $removeIds): void
    {
        if (! method_exists($owner, 'images')) {
            throw new \LogicException('The content model does not support image galleries.');
        }

        $images = $owner->images();
        $toRemove = $removeIds === [] ? collect() : $images->whereIn('id', $removeIds)->get();

        if ($toRemove->count() !== count(array_unique(array_map('intval', $removeIds)))) {
            throw ValidationException::withMessages([
                'remove_image_ids' => 'An image selected for removal does not belong to this content record.',
            ]);
        }

        $maxFiles = (int) config('tourism.image_upload.max_files', 10);
        $remainingCount = $images->count() - $toRemove->count();

        if ($remainingCount + count($files) > $maxFiles) {
            throw ValidationException::withMessages([
                'images' => "A maximum of {$maxFiles} gallery images is allowed per content record.",
            ]);
        }

        foreach ($toRemove as $image) {
            $this->removedPaths[] = $image->path;
            $image->delete();
        }

        foreach ($files as $index => $file) {
            $path = $this->store($file, 'content-images');
            $images->create([
                'path' => $path,
                'sort_order' => $remainingCount + $index,
            ]);
        }
    }

    public function deleteAfterCommit(?string $path): void
    {
        if (
            is_string($path)
            && ($path !== '')
            && (
                str_starts_with($path, 'announcements/')
                || str_starts_with($path, 'content-images/')
            )
        ) {
            $this->removedPaths[] = $path;
        }
    }

    public function deleteAll(Model $owner): void
    {
        if (! method_exists($owner, 'images')) {
            throw new \LogicException('The content model does not support image galleries.');
        }

        $this->sync($owner, [], $owner->images()->pluck('id')->all());
    }

    private function deletePaths(array $paths): void
    {
        foreach (array_unique($paths) as $path) {
            if (! Storage::disk('public')->exists($path)) {
                continue;
            }

            if (! Storage::disk('public')->delete($path)) {
                Log::warning('Unable to delete a tourism content image from public storage.', [
                    'path' => $path,
                ]);
            }
        }
    }
}
