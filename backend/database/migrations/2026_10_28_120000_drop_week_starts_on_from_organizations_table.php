<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The column was also briefly removed from the create migration itself,
        // so databases migrated fresh in that window never had it.
        if (! Schema::hasColumn('organizations', 'week_starts_on')) {
            return;
        }

        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('week_starts_on');
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->unsignedTinyInteger('week_starts_on')->default(1); // 0 (Sunday) .. 6 (Saturday)
        });
    }
};
