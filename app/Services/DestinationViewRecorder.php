<?php

namespace App\Services;

use App\Models\Resort;
use App\Models\TouristSpot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DestinationViewRecorder
{
    public function record(Request $request, TouristSpot|Resort $destination): void
    {
        $visitorKey = hash_hmac('sha256', $request->session()->getId(), (string) config('app.key'));
        $type = $destination instanceof TouristSpot ? 'spot' : 'resort';

        DB::table('destination_views')->upsert(
            [[
                'destination_type' => $type,
                'destination_id' => $destination->getKey(),
                'visitor_key' => $visitorKey,
                'viewed_on' => now('Asia/Manila')->toDateString(),
                'viewed_at' => now(),
            ]],
            ['destination_type', 'destination_id', 'visitor_key', 'viewed_on'],
            ['visitor_key'],
        );
    }
}
