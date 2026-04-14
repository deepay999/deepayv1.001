<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reward_point_ledger', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('trx', 64)->index();
            $table->string('entry_type', 10)->comment('earn|redeem|expire|adjust');
            $table->bigInteger('points')->comment('Positive for earn, negative for redeem/expire');
            $table->bigInteger('running_balance')->default(0)->comment('Points balance after this entry');
            $table->string('description')->nullable();
            $table->string('source', 50)->nullable()->comment('send_money|payout|signup_bonus|campaign etc.');
            $table->string('reference_id')->nullable()->comment('Optional reference to source event');
            $table->timestamp('expires_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_point_ledger');
    }
};
