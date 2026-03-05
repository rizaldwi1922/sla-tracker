<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Email;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EmailInboxController extends Controller
{
    public function index(Request $request)
    {
        $emails = Email::with(['buyer', 'sales'])
            ->where('type', 'inbox')
            ->latest('received_at')
            ->paginate(20);

        $emails->getCollection()->transform(function ($email) {

            $receivedAt = Carbon::parse($email->received_at);

            $endTime = $email->first_reply_at
                ? Carbon::parse($email->first_reply_at)
                : now();

            // Pastikan waktu tidak terbalik
            if ($endTime->lt($receivedAt)) {
                $minutes = 0;
            } else {
                $minutes = $receivedAt->diffInMinutes($endTime);
            }

            $slaDuration = $this->formatMinutes($minutes);

            return [
                'id' => $email->id,
                'sender_email' => $email->from_email,
                'company_name' => $email->buyer->company ?? null,
                'subject' => $email->subject,
                'received_date' => $receivedAt,
                'due_date' => $email->sla_due_at,
                'sla_status' => $this->calculateStatus($email),
                'sla_duration' => $slaDuration,
                'sales' => $email->sales->name ?? null,
                'thread_id' => $email->thread_id,
                'is_replied' => !is_null($email->first_reply_at),
                'body_preview' => $this->previewBody($email->body),
            ];
        });

        return response()->json($emails);
    }


    private function calculateStatus($email)
    {

        if (!$email->first_reply_at) {

            if (now()->gt($email->sla_due_at)) {
                return "Overdue";
            }

            return "Pending";
        }

        if ($email->first_reply_at <= $email->sla_due_at) {
            return "On-Time";
        }

        return "Overdue";
    }

    private function previewBody($body, $limit = 120)
    {
        if (!$body) {
            return null;
        }

        // hilangkan HTML
        $text = strip_tags($body);

        // rapikan whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        return \Illuminate\Support\Str::limit(trim($text), $limit);
    }


    private function formatMinutes($minutes)
    {
        $h = floor($minutes / 60);
        $m = $minutes % 60;

        if ($h === 0) {
            return "{$m}m";
        }

        if ($m === 0) {
            return "{$h}h";
        }

        return "{$h}h {$m}m";
    }

    public function show($threadId)
    {
        $emails = Email::with(['buyer', 'sales'])
            ->where('thread_id', $threadId)
            ->orderBy('received_at')
            ->get();

        if ($emails->isEmpty()) {
            return response()->json([]);
        }

        $first = $emails->first();

        return response()->json([
            'thread_id' => $threadId,

            'buyer' => [
                'company_name' => $first->buyer?->company,
                'email'        => $first->buyer?->email
            ],

            'sales' => [
                'name'  => $first->sales?->name,
                'email' => $first->sales?->email
            ],

            'messages' => $emails->map(function ($e) {
                return [
                    'id' => $e->id,
                    'type' => $e->type,
                    'from_email' => $e->from_email,
                    'to_email' => $e->to_email,
                    'subject' => $e->subject,
                    'body_html' => $e->body_html,
                    'body' => $e->body,
                    'received_at' => $e->received_at
                ];
            })
        ]);
    }
}
