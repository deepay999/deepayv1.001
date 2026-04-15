<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            // provider: google, facebook, github, etc.
            $table->string('provider', 32);
            $table->string('provider_id');
            // user_type: user | agent | merchant
            $table->string('user_type', 20);
            $table->unsignedBigInteger('user_id');
            // Optional: cache the provider's profile token/avatar
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();

            // Prevent duplicate provider bindings for the same account type
            $table->unique(['provider', 'provider_id', 'user_type'], 'social_accounts_provider_unique');
            // Prevent binding the same social account to two different users of the same type
            $table->index(['user_type', 'user_id'], 'social_accounts_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
