<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('financial_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('event_id')->nullable();
            $table->string('event_type')->nullable();
            $table->boolean('signature_valid')->default(false);
            $table->timestamp('received_at');
            $table->timestamp('event_timestamp')->nullable();
            $table->json('payload');
            $table->string('payload_hash');
            $table->string('processing_status');
            $table->string('linked_reference_type')->nullable();
            $table->unsignedBigInteger('linked_reference_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'event_id']);
            $table->index(['provider', 'processing_status']);
            $table->index(['linked_reference_type', 'linked_reference_id'], 'fwe_linked_ref_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_webhook_events');
    }
};