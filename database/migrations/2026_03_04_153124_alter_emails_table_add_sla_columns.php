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
        Schema::table('emails', function (Blueprint $table) {

            // relasi buyer
            $table->foreignId('buyer_id')
                ->nullable()
                ->after('id')
                ->constrained('buyers')
                ->nullOnDelete();

            // relasi sales
            $table->foreignId('sales_id')
                ->nullable()
                ->after('buyer_id')
                ->constrained('users')
                ->nullOnDelete();

            // SLA fields
            $table->timestamp('sla_due_at')
                ->nullable()
                ->after('received_at');

            $table->timestamp('first_reply_at')
                ->nullable()
                ->after('sla_due_at');

            // index tambahan untuk query SLA
            $table->index(['thread_id', 'type'], 'emails_thread_type_idx');

            // index untuk report sales
            $table->index(['sales_id', 'received_at'], 'emails_sales_received_idx');
        });
    }

    public function down(): void
    {
        Schema::table('emails', function (Blueprint $table) {

            $table->dropIndex('emails_thread_type_idx');
            $table->dropIndex('emails_sales_received_idx');

            $table->dropForeign(['buyer_id']);
            $table->dropColumn('buyer_id');

            $table->dropForeign(['sales_id']);
            $table->dropColumn('sales_id');

            $table->dropColumn('sla_due_at');
            $table->dropColumn('first_reply_at');
        });
    }
};
