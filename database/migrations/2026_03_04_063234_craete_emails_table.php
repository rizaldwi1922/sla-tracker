<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('emails', function (Blueprint $table) {

            $table->id();

            $table->string('gmail_message_id')->unique();
            $table->string('thread_id')->index();

            $table->string('from_email')->nullable();
            $table->string('to_email')->nullable();
            $table->string('subject')->nullable();
            $table->longText('body')->nullable();
            $table->longText('body_html')->nullable();

            $table->enum('type', ['inbox', 'sent']);

            $table->timestamp('received_at')->nullable();

            $table->json('raw_email_json')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
