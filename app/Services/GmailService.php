<?php

namespace App\Services;

use App\Models\GmailAccount;
use Illuminate\Support\Facades\Http;

class GmailService
{
    public function getValidAccessToken(GmailAccount $gmail)
    {
        if ($gmail->token_expiry && $gmail->token_expiry->isFuture()) {
            return $gmail->access_token;
        }

        return $this->refreshAccessToken($gmail);
    }

    private function refreshAccessToken(GmailAccount $gmail)
    {
        $response = Http::asForm()->post(
            'https://oauth2.googleapis.com/token',
            [
                'client_id' => config('services.google.client_id'),
                'client_secret' => config('services.google.client_secret'),
                'refresh_token' => $gmail->refresh_token,
                'grant_type' => 'refresh_token'
            ]
        );

        $data = $response->json();

        $gmail->update([
            'access_token' => $data['access_token'],
            'token_expiry' => now()->addSeconds($data['expires_in'])
        ]);

        return $data['access_token'];
    }

    public function startWatch(GmailAccount $account)
    {
        $token = $this->getValidAccessToken($account);

        $response = Http::withToken($token)
        ->post(
            'https://gmail.googleapis.com/gmail/v1/users/me/watch',
            [
                'topicName' => env('GMAIL_TOPIC'),
                'labelIds' => ['INBOX', 'SENT']
            ]
        );

        if (!$response->successful()) {

            \Log::error('GMAIL WATCH FAILED', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'topic'  => env('GMAIL_TOPIC'),
                'topic_1' => config('services.gmail.topic')
            ]);

            return false;
        }

        $data = $response->json();

        $account->history_id = $data['historyId'] ?? null;
        $account->watch_expiry = now()->addDays(7);

        $account->save();

        return $data;
    }
}
