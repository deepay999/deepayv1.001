<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('swan_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('swan_account_id')->unique()->nullable();
            $table->string('iban')->nullable();
            $table->string('bic')->nullable();
            $table->string('account_holder_name')->nullable();
            $table->tinyInteger('status')->default(0)->comment('0=pending,1=active,2=suspended,9=closed');
            $table->string('currency', 10)->default('EUR');
            $table->json('swan_payload')->nullable()->comment('Raw Swan API response');
            $table->timestamp('activated_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swan_accounts');
    }
};
