<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'email_otps',
            function (Blueprint $table) {
                /*
                 * Hashed OTP requires more than the original
                 * six-character column length.
                 */
                $table
                    ->string('otp', 255)
                    ->change();

                $table
                    ->string('purpose', 50)
                    ->default('password_reset')
                    ->after('user_id');

                $table
                    ->unsignedTinyInteger('attempts')
                    ->default(0)
                    ->after('otp');

                $table
                    ->timestamp('sent_at')
                    ->nullable()
                    ->after('attempts');

                $table
                    ->timestamp('verified_at')
                    ->nullable()
                    ->after('expires_at');

                $table
                    ->timestamp('consumed_at')
                    ->nullable()
                    ->after('verified_at');

                $table
                    ->string('reset_token_hash', 64)
                    ->nullable()
                    ->unique()
                    ->after('consumed_at');

                $table->index([
                    'user_id',
                    'purpose',
                ]);
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'email_otps',
            function (Blueprint $table) {
                $table->dropIndex([
                    'user_id',
                    'purpose',
                ]);

                $table->dropUnique([
                    'reset_token_hash',
                ]);

                $table->dropColumn([
                    'purpose',
                    'attempts',
                    'sent_at',
                    'verified_at',
                    'consumed_at',
                    'reset_token_hash',
                ]);

                $table
                    ->string('otp', 6)
                    ->change();
            }
        );
    }
};