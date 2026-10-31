<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name');
            $table->string('project_template'); // lots|herd|resale|simple — App\Domain\Project\Enums\ProjectTemplate
            $table->string('status')->default('active'); // App\Domain\Project\Enums\ProjectStatus
            $table->string('graph_color');
            $table->date('started_on');

            // Minor units (ADR 0005) — App\Support\Money, never a float.
            $table->bigInteger('seed_budget');

            // Wizard étape 3 ("Objectif") — App\Domain\Project\Enums\ProjectGoalType. The unit of
            // goal_target depends on goal_type: minor-units money for the money-based goals,
            // a plain count for the quantity-based one.
            $table->string('goal_type');
            $table->bigInteger('goal_target');
            $table->date('goal_due_on');

            $table->jsonb('modules')->default('[]');
            // Per-project verdict thresholds (starting/profitable/watch/loss) — never computed
            // results themselves, those are always derived from entries (rule 4).
            $table->jsonb('settings')->default('{}');

            // Populated by the future Syncable trait (ADR 0003) from sync_version_seq; nullable
            // until that trait exists, since nothing sets it yet.
            $table->unsignedBigInteger('version')->nullable();
            $table->index(['organization_id', 'version']);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
