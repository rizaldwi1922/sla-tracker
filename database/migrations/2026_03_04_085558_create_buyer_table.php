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
        Schema::create('buyers', function (Blueprint $table) {
            $table->id();

            $table->string('email')->unique();
            $table->string('company');
            $table->string('pic_name');

            $table->foreignId('assigned_sales')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->boolean('is_active')->default(true);

            $table->timestamp('registered_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buyers');
    }
};
