<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class TouristSpot extends Model
{
    protected $fillable = [
        'name',
        'description',
        'location',
        'category',
        'image_url',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function images(): MorphMany
    {
        return $this->morphMany(ContentImage::class, 'imageable')->orderBy('sort_order')->orderBy('id');
    }
}
