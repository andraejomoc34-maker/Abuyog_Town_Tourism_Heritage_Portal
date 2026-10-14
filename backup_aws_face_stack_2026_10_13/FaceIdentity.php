<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $face_id
 * @property string $face_id_hash
 * @property string $external_image_id
 * @property string $external_image_id_hash
 * @property Carbon $consented_at
 */
#[Fillable(['user_id', 'face_id', 'face_id_hash', 'external_image_id', 'external_image_id_hash', 'consented_at'])]
#[Hidden(['face_id', 'face_id_hash', 'external_image_id', 'external_image_id_hash'])]
class FaceIdentity extends Model
{
    protected $table = 'user_face_identities';

    protected function casts(): array
    {
        return [
            'face_id' => 'encrypted',
            'external_image_id' => 'encrypted',
            'consented_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
