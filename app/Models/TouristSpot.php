<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
