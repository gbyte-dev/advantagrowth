<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('restaurant_marquee_items');
    }

    public function down(): void
    {
        // Old marquee feature permanently removed.
        // Table is intentionally not recreated.
    }
};