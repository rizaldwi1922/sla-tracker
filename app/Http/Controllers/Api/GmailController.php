<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\GmailAccount;
use App\Services\GmailService;

class GmailController extends Controller
{
    protected $base_url = "https://gmail.googleapis.com/gmail/v1/";

    /*
    |--------------------------------------------------------------------------
    | LIST INBOX
    |--------------------------------------------------------------------------
    */

    public function inbox(Request $request, $gmailAccountId, GmailService $gmailService)
    {
        $account = GmailAccount::findOrFail($gmailAccountId);

        $token = $gmailService->getValidAccessToken($account);

        $query = [
            'q' => 'in:inbox',
            'maxResults' => 10
        ];

        if ($request->page_token) {
            $query['pageToken'] = $request->page_token;
        }

        $list = Http::withToken($token)->get(
            $this->base_url . "users/me/messages",
            $query
        )->json();

        $emails = [];

        foreach ($list['messages'] ?? [] as $msg) {

            $detail = Http::withToken($token)->get(
                $this->base_url . "users/me/messages/" . $msg['id'],
                [
                    'format' => 'metadata',
                    'metadataHeaders' => [
                        'Subject',
                        'From',
                        'Date'
                    ]
                ]
            )->json();

            $emails[] = [
                'id' => $detail['id'],
                'threadId' => $detail['threadId'],
                'snippet' => $detail['snippet'] ?? null,
                'subject' => $this->getHeader($detail, 'Subject'),
                'from' => $this->getHeader($detail, 'From'),
                'date' => $this->getHeader($detail, 'Date')
            ];
        }

        return response()->json([
            'emails' => $emails,
            'next_page_token' => $list['nextPageToken'] ?? null,
            'total_estimate' => $list['resultSizeEstimate'] ?? null
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | LIST SENT
    |--------------------------------------------------------------------------
    */

    public function sent(Request $request, $gmailAccountId, GmailService $gmailService)
    {
        $account = GmailAccount::findOrFail($gmailAccountId);

        $token = $gmailService->getValidAccessToken($account);

        $query = [
            'q' => 'in:sent',
            'maxResults' => 10
        ];

        if ($request->page_token) {
            $query['pageToken'] = $request->page_token;
        }

        $list = Http::withToken($token)->get(
            $this->base_url . "users/me/messages",
            $query
        )->json();

        $emails = [];

        foreach ($list['messages'] ?? [] as $msg) {

            $detail = Http::withToken($token)->get(
                $this->base_url . "users/me/messages/" . $msg['id'],
                [
                    'format' => 'metadata',
                    'metadataHeaders' => [
                        'Subject',
                        'From',
                        'To',
                        'Date'
                    ]
                ]
            )->json();

            $emails[] = [
                'id' => $detail['id'],
                'threadId' => $detail['threadId'],
                'snippet' => $detail['snippet'] ?? null,
                'subject' => $this->getHeader($detail, 'Subject'),
                'from' => $this->getHeader($detail, 'From'),
                'to' => $this->getHeader($detail, 'To'),
                'date' => $this->getHeader($detail, 'Date')
            ];
        }

        return response()->json([
            'emails' => $emails,
            'next_page_token' => $list['nextPageToken'] ?? null,
            'total_estimate' => $list['resultSizeEstimate'] ?? null
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | DETAIL EMAIL
    |--------------------------------------------------------------------------
    */

    public function detail($gmailAccountId, $messageId, GmailService $gmailService)
    {
        $account = GmailAccount::findOrFail($gmailAccountId);

        $token = $gmailService->getValidAccessToken($account);

        $response = Http::withToken($token)->get(
            $this->base_url . "users/me/messages/$messageId",
            [
                'format' => 'full'
            ]
        );

        return response()->json($response->json());
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
}
