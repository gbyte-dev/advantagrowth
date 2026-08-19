<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('restaurant_stories');
    }

    public function down(): void
    {
        // Intentionally not recreated.
        // Old Restaurant Story feature has been removed.
    }
};