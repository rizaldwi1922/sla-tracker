<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GmailService;
use App\Models\GmailAccount;

class GmailRefreshWatch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:gmail-refresh-watch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle(GmailService $gmailService)
    {
        $accounts = GmailAccount::all();

        foreach ($accounts as $account) {

            $gmailService->startWatch($account);
        }
    }
}
