<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'recommendations',
            function (
                Blueprint $table
            ) {
                /*
                 * Stores verified analytics source paths
                 * and values supporting the recommendation.
                 *
                 * Nullable keeps existing recommendations
                 * compatible with this migration.
                 */

                $table
                    ->json(
                        'evidence'
                    )
                    ->nullable()
                    ->after(
                        'expected_impact'
                    );
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'recommendations',
            function (
                Blueprint $table
            ) {
                $table->dropColumn(
                    'evidence'
                );
            }
        );
    }
};