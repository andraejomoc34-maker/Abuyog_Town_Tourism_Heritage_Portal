<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'face_service' => [
        'url' => env('FACE_SERVICE_URL', 'http://127.0.0.1:8001'),
        'token' => env('FACE_SERVICE_TOKEN'),
        'enabled' => filter_var(env('FACE_VERIFICATION_ENABLED', false), FILTER_VALIDATE_BOOLEAN),
        'timeout' => (int) env('FACE_SERVICE_TIMEOUT_SECONDS', 20),
        'model' => env('FACE_SERVICE_MODEL', 'Facenet'),
        'distance_metric' => env('FACE_SERVICE_DISTANCE_METRIC', 'cosine'),
        'threshold' => (float) env('FACE_SERVICE_THRESHOLD', 0.40),
    ],

    'face_liveness' => [
        'region' => env('AWS_FACE_LIVENESS_REGION', env('AWS_DEFAULT_REGION', 'us-east-1')),
        'identity_pool_id' => env('AWS_COGNITO_IDENTITY_POOL_ID'),
        'browser_region' => env('VITE_AWS_FACE_LIVENESS_REGION'),
        'browser_identity_pool_id' => env('VITE_AWS_COGNITO_IDENTITY_POOL_ID'),
        'confidence_threshold' => (float) env('FACE_LIVENESS_CONFIDENCE_THRESHOLD', 80),
    ],

    'face_recognition' => [
        'collection_id' => env('AWS_FACE_RECOGNITION_COLLECTION_ID'),
        'match_threshold' => (float) env('FACE_RECOGNITION_MATCH_THRESHOLD', 99),
        'uncertain_threshold' => (float) env('FACE_RECOGNITION_UNCERTAIN_THRESHOLD', 90),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],

];
