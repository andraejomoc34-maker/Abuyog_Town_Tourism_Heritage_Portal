<?php

return [
    'image_upload' => [
        'max_files' => (int) env('TOURISM_IMAGE_MAX_FILES', 10),
        'max_kilobytes' => (int) env('TOURISM_IMAGE_MAX_KILOBYTES', 5120),
    ],
];
