<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\GmailAccount;
use App\Models\Email;
use App\Services\GmailService;
use Illuminate\Support\Facades\Http;
use App\Models\Buyer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GmailWebhookController extends Controller
{
    protected $base_url = "https://gmail.googleapis.com/gmail/v1/";

    public function handle(Request $request)
    {

        $data = $request->input('message.data');

        if (!$data) {
            return response()->json(['ok' => true], 200);
        }

        $decoded = json_decode(base64_decode($data), true);
         \Log::error('GMAIL WEBHOOK -> new', $decoded);

        $emailAddress = $decoded['emailAddress'];
        $historyId = $decoded['historyId'];

        $gmail = GmailAccount::where('google_email', $emailAddress)->first();

        if (!$gmail) {
            return response()->json(['ok' => true], 200);
        }

        $gmailService = app(GmailService::class);
        $token = $gmailService->getValidAccessToken($gmail);

        // checkpoint pertama
        if (!$gmail->history_id) {
            $gmail->history_id = $historyId;
            $gmail->save();

            return response()->json(['ok' => true], 200);
        }

        // ambil history gmail
        $response = Http::withToken($token)->get(
            $this->base_url . 'users/me/history',
            [
                'startHistoryId' => $gmail->history_id
            ]
        );

        $history = $response->json();

        foreach ($history['history'] ?? [] as $h) {

            foreach ($h['messagesAdded'] ?? [] as $msg) {

                $messageId = $msg['message']['id'];

                $this->processEmail($token, $messageId);
            }
        }

        // update checkpoint
        $gmail->history_id = $historyId;
        $gmail->save();

        return response()->json(['ok' => true], 200);
    }



    private function processEmail($token, $messageId)
    {
        $response = Http::withToken($token)->get(
            $this->base_url . "users/me/messages/$messageId",
            [
                'format' => 'full'
            ]
        );

        if (!$response->successful()) {
            \Log::error('GMAIL MESSAGE FETCH FAILED', [
                'message_id' => $messageId,
                'status' => $response->status()
            ]);

            return;
        }

        $email = $response->json();

        $labels = $email['labelIds'] ?? [];

        $type = null;

        if (in_array('INBOX', $labels)) {
            $type = 'inbox';
        }

        if (in_array('SENT', $labels)) {
            $type = 'sent';
        }

        if (!$type) {
            return;
        }

        $plain = null;
        $html = null;

        $this->extractBodies($email['payload'] ?? null, $plain, $html);

        // headers
        $fromHeader = $this->getHeader($email, 'From');
        $toHeader   = $this->getHeader($email, 'To');

        $fromEmail = $this->extractEmail($fromHeader);
        $toEmail   = $this->extractEmail($toHeader);

        /*
    |--------------------------------------------------------------------------
    | Find buyer
    |--------------------------------------------------------------------------
    */

        $buyer = null;

        if ($type === 'inbox') {
            $buyer = Buyer::where('email', $fromEmail)
                ->where('is_active', true)
                ->first();
        } else {
            $buyer = Buyer::where('email', $toEmail)
                ->where('is_active', true)
                ->first();
        }

        if (!$buyer) {
            return;
        }

        /*
    |--------------------------------------------------------------------------
    | Determine sales
    |--------------------------------------------------------------------------
    */

        $salesId = null;

        if ($type === 'inbox') {

            $salesUser = User::where('email', $toEmail)
                ->where('role', 'sales')
                ->first();

            $salesId = $salesUser?->id;
        } else {

            $salesUser = User::where('email', $fromEmail)
                ->where('role', 'sales')
                ->first();

            $salesId = $salesUser?->id;
        }

        /*
    |--------------------------------------------------------------------------
    | SLA
    |--------------------------------------------------------------------------
    */

        $slaMinutes = 10;

        $receivedAt = Carbon::parse(
            $this->getHeader($email, 'Date')
        );

        $slaDue = null;

        if ($type === 'inbox') {
            $slaDue = $receivedAt->copy()->addMinutes($slaMinutes);
        }

        Email::firstOrCreate(
            [
                'gmail_message_id' => $email['id']
            ],
            [
                'buyer_id' => $buyer->id,
                'sales_id' => $salesId,

                'thread_id' => $email['threadId'],

                'from_email' => $fromEmail,
                'to_email'   => $toEmail,

                'subject' => $this->getHeader($email, 'Subject'),

                'received_at' => $receivedAt,

                'sla_due_at' => $slaDue,

                'type' => $type,

                'body' => $plain,
                'body_html' => $html,

                'raw_email_json' => $email
            ]
        );

        /*
    |--------------------------------------------------------------------------
    | Process SLA per thread
    |--------------------------------------------------------------------------
    */

        $this->processThreadSLA($email['threadId']);
    }



    private function getHeader($email, $headerName)
    {

        foreach ($email['payload']['headers'] ?? [] as $header) {

            if ($header['name'] === $headerName) {
                return $header['value'];
            }
        }

        return null;
    }

    private function extractBodies($payload, &$plain = null, &$html = null)
    {
        if (!$payload) {
            return;
        }

        // jika part ini langsung berisi body
        if (isset($payload['mimeType'])) {

            if ($payload['mimeType'] === 'text/plain' && isset($payload['body']['data'])) {
                $plain = $this->decodeBody($payload['body']['data']);
            }

            if ($payload['mimeType'] === 'text/html' && isset($payload['body']['data'])) {
                $html = $this->decodeBody($payload['body']['data']);
            }
        }

        // jika memiliki child parts
        if (!empty($payload['parts'])) {
            foreach ($payload['parts'] as $part) {
                $this->extractBodies($part, $plain, $html);
            }
        }
    }

    private function decodeBody($data)
    {
        $data = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($data);
    }

    private function extractEmail($value)
    {
        if (!$value) {
            return null;
        }

        if (preg_match('/<(.+?)>/', $value, $matches)) {
            return strtolower(trim($matches[1]));
        }

        return strtolower(trim($value));
    }

    private function processThreadSLA($threadId)
    {
        $replies = DB::table('emails')
            ->where('thread_id', $threadId)
            ->where('type', 'sent')
            ->orderBy('received_at')
            ->get();

        foreach ($replies as $reply) {

            $affected = DB::table('emails')
                ->where('thread_id', $threadId)
                ->where('type', 'inbox')
                ->whereNull('first_reply_at')
                ->where('received_at', '<', $reply->received_at)
                ->update([
                    'first_reply_at' => $reply->received_at
                ]);

            if ($affected === 0) {
                continue;
            }
        }

        return true;
    }
}
