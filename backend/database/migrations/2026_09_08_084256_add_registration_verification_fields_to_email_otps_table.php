<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'email_otps',
            function (Blueprint $table) {
                /*
                 * Secure hashes require more than
                 * the original six-character length.
                 */
                $table
                    ->string('otp', 255)
                    ->change();

                $table
                    ->string('purpose', 50)
                    ->default(
                        'email_verification'
                    )
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

                /*
                 * A separate user_id index already
                 * supports the foreign key.
                 */
                $table->index(
                    [
                        'user_id',
                        'purpose',
                    ],
                    'email_otps_user_purpose_lookup'
                );
            }
        );
    }

    public function down(): void
    {
        /*
         * OTPs are temporary security records.
         * They cannot remain usable after the
         * verification feature is rolled back.
         */
        DB::table('email_otps')
            ->delete();

        Schema::table(
            'email_otps',
            function (Blueprint $table) {
                $table->dropIndex(
                    'email_otps_user_purpose_lookup'
                );

                $table->dropColumn([
                    'purpose',
                    'attempts',
                    'sent_at',
                    'verified_at',
                    'consumed_at',
                ]);

                $table
                    ->string('otp', 6)
                    ->change();
            }
        );
    }
};