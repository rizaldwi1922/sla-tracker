<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\GmailAccount;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use App\Services\GmailService;

class GoogleAuthController
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send'
            ])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent'
            ])
            ->stateless()
            ->redirect();
    }

    public function callback(GmailService $gmailService)
    {
        $googleUser = Socialite::driver('google')
            ->stateless()
            ->user();

        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name,
                'email' => $googleUser->email,
                'password' => bcrypt(Str::random(32)),
                'role' => 'sales',
                'is_active' => true
            ]);
        }

        $gmailAccount = GmailAccount::where('user_id', $user->id)->first();

        $gmail = GmailAccount::updateOrCreate(
            ['user_id' => $user->id],
            [
                'google_email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'access_token' => $googleUser->token,

                // jangan timpa refresh token dengan null
                'refresh_token' => $googleUser->refreshToken ?? $gmailAccount?->refresh_token,

                'token_expiry' => now()->addSeconds($googleUser->expiresIn),
            ]
        );

        $gmailService->startWatch($gmail);

        $jwt = JWTAuth::fromUser($user);

        return redirect("/oauth-success?token=$jwt");
    }
}
