<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Existing owner accounts were created before
     * registration email verification was introduced.
     */
    private const LEGACY_VERIFIED_AT =
        '2026-09-08 11:35:08';

    public function up(): void
    {
        DB::table('users')
            ->where('role', 'owner')
            ->whereNull('email_verified_at')
            ->update([
                'email_verified_at' =>
                    self::LEGACY_VERIFIED_AT,
            ]);
    }

    public function down(): void
    {
        /*
         * Only undo records marked by this migration.
         * Owners genuinely verified through OTP remain untouched.
         */

        DB::table('users')
            ->where('role', 'owner')
            ->where(
                'email_verified_at',
                self::LEGACY_VERIFIED_AT
            )
            ->update([
                'email_verified_at' => null,
            ]);
    }
};