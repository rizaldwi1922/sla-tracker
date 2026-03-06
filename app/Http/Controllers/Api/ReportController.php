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
                    'due_at' => $email->sla_due_at,
                    'preview' => Str::limit(
                        trim(strip_tags($email->body)),
                        140
                    ),
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
                    'sales' => $email->sales->name ?? null,
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

    public function slaReport(Request $request)
    {
        $salesId = $request->sales_id;
        $range   = $request->range ?? 30;

        $startDate = now()->subDays($range);

        $query = Email::where('type', 'inbox')
            ->where('received_at', '>=', $startDate);

        if ($salesId) {
            $query->where('sales_id', $salesId);
        }

        /*
    |--------------------------------------------------------------------------
    | RESPONSE TIME DISTRIBUTION
    |--------------------------------------------------------------------------
    */

        $distribution = DB::table('emails')
            ->selectRaw("
            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (first_reply_at - received_at))/3600 < 1
            ) as under_1h,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (first_reply_at - received_at))/3600 BETWEEN 1 AND 12
            ) as hour_1_12,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (first_reply_at - received_at))/3600 BETWEEN 12 AND 24
            ) as hour_12_24,

            COUNT(*) FILTER (
                WHERE EXTRACT(EPOCH FROM (first_reply_at - received_at))/3600 > 24
            ) as over_24h
        ")
            ->whereNotNull('first_reply_at')
            ->where('type', 'inbox')
            ->when($salesId, function ($q) use ($salesId) {
                $q->where('sales_id', $salesId);
            })
            ->where('received_at', '>=', $startDate)
            ->first();

        /*
    |--------------------------------------------------------------------------
    | SLA COMPLIANCE
    |--------------------------------------------------------------------------
    */

        $total = $query->count();

        $onTime = Email::where('type', 'inbox')
            ->whereNotNull('first_reply_at')
            ->whereColumn('first_reply_at', '<=', 'sla_due_at')
            ->where('received_at', '>=', $startDate)
            ->when($salesId, function ($q) use ($salesId) {
                $q->where('sales_id', $salesId);
            })
            ->count();

        $compliance = $total > 0
            ? round(($onTime / $total) * 100)
            : 0;

        /*
    |--------------------------------------------------------------------------
    | SALES PERFORMANCE SUMMARY
    |--------------------------------------------------------------------------
    */

        $salesSummary = Email::select(
            'sales_id',
            DB::raw('COUNT(*) as total_emails'),

            DB::raw("
            SUM(
                CASE
                WHEN first_reply_at <= sla_due_at
                THEN 1 ELSE 0
                END
            ) as on_time
        "),

            DB::raw("
            SUM(
                CASE
                WHEN first_reply_at > sla_due_at
                THEN 1 ELSE 0
                END
            ) as overdue
        "),

            DB::raw("
            AVG(
                EXTRACT(EPOCH FROM (first_reply_at - received_at))/3600
            ) as avg_response_hours
        ")

        )
            ->where('type', 'inbox')
            ->whereNotNull('sales_id')
            ->where('received_at', '>=', $startDate)
            ->when($salesId, function ($q) use ($salesId) {
                $q->where('sales_id', $salesId);
            })
            ->groupBy('sales_id')
            ->with('sales:id,name')
            ->get()
            ->map(function ($row) {

                $compliance = $row->total_emails > 0
                    ? round(($row->on_time / $row->total_emails) * 100)
                    : 0;

                return [
                    'sales_id' => $row->sales_id,
                    'sales_name' => $row->sales->name ?? null,
                    'total_emails' => $row->total_emails,
                    'on_time' => $row->on_time,
                    'overdue' => $row->overdue,
                    'avg_response_hours' => round($row->avg_response_hours, 2),
                    'compliance_percent' => $compliance
                ];
            });

        return response()->json([

            'response_time_distribution' => [
                'under_1_hour' => $distribution->under_1h ?? 0,
                'hour_1_12' => $distribution->hour_1_12 ?? 0,
                'hour_12_24' => $distribution->hour_12_24 ?? 0,
                'over_24_hour' => $distribution->over_24h ?? 0
            ],

            'sla_compliance_rate' => $compliance,

            'sales_performance' => $salesSummary
        ]);
    }
}
