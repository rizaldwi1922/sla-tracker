<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Email;
use Illuminate\Support\Str;

class ReportController extends Controller
{

    public function slaDashboard()
    {
        /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

        $totalBuyerEmails = Email::where('type', 'inbox')->count();

        $onTime = Email::where('type', 'inbox')
            ->whereNotNull('first_reply_at')
            ->whereColumn('first_reply_at', '<=', 'sla_due_at')
            ->count();

        $overdue = Email::where('type', 'inbox')
            ->where(function ($q) {

                $q->where(function ($q2) {
                    $q2->whereNull('first_reply_at')
                        ->where('sla_due_at', '<', now());
                })

                    ->orWhere(function ($q2) {
                        $q2->whereNotNull('first_reply_at')
                            ->whereColumn('first_reply_at', '>', 'sla_due_at');
                    });
            })
            ->count();

        $avgMinutes = Email::whereNotNull('first_reply_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (first_reply_at - received_at)) / 60) as avg')
            ->value('avg');

        /*
    |--------------------------------------------------------------------------
    | PERFORMANCE BY SALES
    |--------------------------------------------------------------------------
    */

        $salesPerformance = Email::select(
            'sales_id',
            DB::raw('COUNT(*) as total'),
            DB::raw("
                SUM(
                    CASE
                        WHEN first_reply_at <= sla_due_at
                        THEN 1 ELSE 0
                    END
                ) as on_time
            ")
        )
            ->where('type', 'inbox')
            ->whereNotNull('sales_id')
            ->groupBy('sales_id')
            ->with('sales:id,name')
            ->get()
            ->map(function ($row) {

                $percent = $row->total > 0
                    ? round(($row->on_time / $row->total) * 100)
                    : 0;

                return [
                    'sales_id' => $row->sales_id,
                    'sales_name' => $row->sales->name ?? null,
                    'total_emails' => $row->total,
                    'on_time' => $row->on_time,
                    'performance_percent' => $percent
                ];
            });

        /*
    |--------------------------------------------------------------------------
    | UPCOMING DUE DATES
    |--------------------------------------------------------------------------
    */

        $upcoming = Email::with(['buyer', 'sales'])
            ->where('type', 'inbox')
            ->whereNull('first_reply_at')
            ->where('sla_due_at', '>', now())
            ->orderBy('sla_due_at')
            ->limit(5)
            ->get()
            ->map(function ($email) {

                return [
                    'id' => $email->id,
                    'subject' => $email->subject,
                    'buyer' => $email->buyer->company ?? null,
                    'sales' => $email->sales->name ?? null,
                    'due_at' => $email->sla_due_at
                ];
            });

        /*
    |--------------------------------------------------------------------------
    | REMINDERS
    |--------------------------------------------------------------------------
    */

        $reminders = Email::with('buyer')
            ->where('type', 'inbox')
            ->whereNull('first_reply_at')
            ->where('received_at', '<', now()->subMinutes(10))
            ->orderBy('received_at')
            ->limit(5)
            ->get()
            ->map(function ($email) {

                return [
                    'id' => $email->id,
                    'subject' => $email->subject,
                    'buyer' => $email->buyer->company ?? null,

                    'preview' => Str::limit(
                        trim(strip_tags($email->body)),
                        140
                    ),

                    'hours_waiting' => now()->diffInHours($email->received_at)
                ];
            });

        return response()->json([
            'summary' => [
                'total_buyer_emails' => $totalBuyerEmails,
                'on_time_responses' => $onTime,
                'overdue_responses' => $overdue,
                'avg_response_minutes' => $avgMinutes ? round($avgMinutes) : 0
            ],

            'sales_performance' => $salesPerformance,

            'upcoming_due_dates' => $upcoming,

            'sla_reminders' => $reminders
        ]);
    }
}
