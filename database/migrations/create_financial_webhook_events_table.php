use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Schema;
use Illuminate\Database\Eloquent\Model;

class CreateFinancialWebhookEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('financial_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('gateway');
            $table->string('event_id');
            $table->string('type')->nullable();
            $table->enum('status', ['pending', 'processed', 'failed']);
            $table->json('payload');
            $table->text('error')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'event_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('financial_webhook_events');
    }
}

// Eloquent Model

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinancialWebhookEvent extends Model
{
    protected $fillable = [
        'gateway',
        'event_id',
        'type',
        'status',
        'payload',
        'error',
        'processed_at',
    ];
}