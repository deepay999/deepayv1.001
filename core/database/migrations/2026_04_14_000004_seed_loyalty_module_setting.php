<?php

use App\Models\ModuleSetting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        if (!ModuleSetting::where('slug', 'loyalty_points')->exists()) {
            ModuleSetting::create([
                'user_type'           => 'USER',
                'title'               => 'Loyalty Points',
                'slug'                => 'loyalty_points',
                'description_enabled' => 'Enable this feature to allow users to earn and redeem loyalty points on transactions.',
                'description_disabled' => 'Disable this feature to hide loyalty points from user accounts.',
                'icon'                => 'las la-star',
                'status'              => 1,
            ]);
        }
    }

    public function down(): void
    {
        ModuleSetting::where('slug', 'loyalty_points')->delete();
    }
};
