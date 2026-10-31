<?php

namespace App\Domain\Project\Models;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectStatus;
use App\Domain\Project\Enums\ProjectTemplate;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $organization_id
 * @property int|null $created_by
 * @property string $name
 * @property ProjectTemplate $project_template
 * @property ProjectStatus $status
 * @property ProjectColor $graph_color
 * @property Carbon $started_on
 * @property int $seed_budget
 * @property ProjectGoalType $goal_type
 * @property int $goal_target
 * @property Carbon $goal_due_on
 * @property array<int, string> $modules
 * @property array<string, mixed> $settings
 * @property int|null $version
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['name', 'project_template', 'graph_color', 'started_on', 'seed_budget', 'goal_type', 'goal_target', 'goal_due_on', 'modules'])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    /**
     * Mirrors the DB defaults for status/settings, which Eloquent otherwise only
     * sees after a round-trip (migrations.md: "Mirror Defaults Only When Unsaved
     * Models Need Them").
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => ProjectStatus::ACTIVE->value,
        'settings' => '{}',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'project_template' => ProjectTemplate::class,
            'status' => ProjectStatus::class,
            'graph_color' => ProjectColor::class,
            'started_on' => 'date',
            'seed_budget' => 'integer',
            'goal_type' => ProjectGoalType::class,
            'goal_target' => 'integer',
            'goal_due_on' => 'date',
            'modules' => 'array',
            'settings' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
