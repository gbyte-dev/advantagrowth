<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Existing accounts were created before
         * email verification became mandatory.
         *
         * Mark them verified so current owners,
         * staff and super admins are not locked out.
         * New registrations created after this
         * migration will still start unverified.
         */
        DB::table('users')
            ->whereNull(
                'email_verified_at'
            )
            ->whereIn(
                'role',
                [
                    'owner',
                    'staff',
                    'super_admin',
                ]
            )
            ->update([
                'email_verified_at' =>
                    now(),
            ]);
    }

    public function down(): void
    {
        /*
         * Intentionally not reversed.
         *
         * We cannot safely distinguish accounts
         * verified by this migration from accounts
         * genuinely verified afterward.
         */
    }
};