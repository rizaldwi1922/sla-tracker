<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GmailAccount extends Model
{
    protected $table = "gmail_account";

    protected $fillable = [
        'user_id',
        'google_email',
        'google_id',
        'access_token',
        'refresh_token',
        'token_expiry',
    ];

    protected $casts = [
        'token_expiry' => 'datetime',
    ];
}
