<?php

namespace App\Http\Controllers;

use App\Models\Resort;
use App\Models\TouristSpot;
use App\Services\DestinationViewRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DestinationViewController extends Controller
{
    public function store(Request $request, DestinationViewRecorder $recorder): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['spot', 'resort'])],
            'id' => ['required', 'integer', 'min:1'],
        ]);

        $destination = $validated['type'] === 'spot'
            ? TouristSpot::query()->where('status', 'active')->findOrFail($validated['id'])
            : Resort::query()->where('status', 'active')->findOrFail($validated['id']);

        $recorder->record($request, $destination);

        return response()->json(['recorded' => true], 202);
    }
}
