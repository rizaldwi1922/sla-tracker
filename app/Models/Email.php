<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $fillable = [
        'gmail_message_id',
        'thread_id',
        'from_email',
        'to_email',
        'subject',
        'type',
        'received_at',
        'raw_email_json',
        'body',
        'body_html',
        'buyer_id',
        'sales_id',
        'sla_due_at',
        'first_reply_at'
    ];

    protected $casts = [
        'raw_email_json' => 'array',
        'received_at' => 'datetime'
    ];

    public function buyer()
    {
        return $this->belongsTo(Buyer::class);
    }

    public function sales()
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function getSlaStatusAttribute()
    {
        if ($this->type !== 'inbox') {
            return null;
        }

        if ($this->first_reply_at) {

            return $this->first_reply_at <= $this->sla_due_at
                ? 'on_time'
                : 'overdue';
        }

        return now()->gt($this->sla_due_at)
            ? 'overdue'
            : 'pending';
    }
}
