<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    protected $fillable = [
        'user_id',
        'resort_id',
        'message',
        'contact_information',
        'status',
    ];

    protected $attributes = [
        'status' => 'Pending',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resort(): BelongsTo
    {
        return $this->belongsTo(Resort::class);
    }
}
