<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One organization has many users; each user belongs to at most one organization,
 * with a role in it — see App\Domain\Organization\Enums\Role. Kept separate from the
 * users migration because it must run after organizations exists.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('organization_id')->nullable()->after('password')->constrained()->nullOnDelete();
            $table->string('role')->nullable()->after('organization_id'); // owner|manager|entry|viewer
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('organization_id');
            $table->dropColumn('role');
        });
    }
};
