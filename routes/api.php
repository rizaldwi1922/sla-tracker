<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\GmailWebhookController;
use Illuminate\Support\Facades\Http;
use App\Services\GmailService;
use App\Http\Controllers\Api\BuyerController;
use App\Http\Controllers\Api\EmailInboxController;
use App\Http\Controllers\Api\GmailController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::post('/gmail/webhook', [GmailWebhookController::class, 'handle']);

Route::get('/test-watch', function (GmailService $gmailService) {

    $account = \App\Models\GmailAccount::first();

    if (!$account) {
        return ['error' => 'gmail account not found'];
    }

    $token = $gmailService->getValidAccessToken($account);

    $response = Http::withToken($token)
        ->post(
            'https://gmail.googleapis.com/gmail/v1/users/me/watch',
            [
                'topicName' => env('GMAIL_TOPIC'),
                'labelIds' => ['INBOX', 'SENT']
            ]
        );

    return [
        'status' => $response->status(),
        'body' => $response->json()
    ];
});

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/buyers', [BuyerController::class, 'index']);
    Route::post('/buyers', [BuyerController::class, 'store']);
    Route::get('/buyers/{id}', [BuyerController::class, 'show']);
    Route::put('/buyers/{id}', [BuyerController::class, 'update']);
    Route::delete('/buyers/{id}', [BuyerController::class, 'destroy']);

    Route::get('/sales', function () {
        return \App\Models\User::where('role', 'sales')
            ->select('id', 'name', 'email')
            ->get();
    });

    Route::get('/sales-gmail', function () {
        return \App\Models\GmailAccount::join('users', 'gmail_account.user_id', 'users.id')
            ->select('gmail_account.id', 'users.name', 'gmail_account.google_email as email')
            ->get();
    });

    Route::get('/emails', [EmailInboxController::class, 'index']);
    Route::get('/emails/{threadId}', [EmailInboxController::class, 'show']);

    Route::prefix('gmail')->group(function () {

        Route::get('/{account}/inbox', [GmailController::class, 'inbox']);

        Route::get('/{account}/sent', [GmailController::class, 'sent']);

        Route::get('/{account}/message/{messageId}', [GmailController::class, 'detail']);
    });
});
