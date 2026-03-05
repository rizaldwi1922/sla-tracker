<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Buyer extends Model
{
    protected $fillable = [
        'email',
        'company',
        'pic_name',
        'assigned_sales',
        'is_active',
        'registered_at'
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'is_active' => 'boolean'
    ];

    public function sales()
    {
        return $this->belongsTo(User::class, 'assigned_sales');
    }
}
