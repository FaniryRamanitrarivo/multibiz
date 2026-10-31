<?php

namespace Database\Factories;

use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->words(2, true),
            'project_template' => ProjectTemplate::SIMPLE,
            'graph_color' => fake()->randomElement(ProjectColor::cases()),
            'started_on' => fake()->dateTimeBetween('-6 months', 'now'),
            'seed_budget' => fake()->numberBetween(0, 50_000_00),
            'goal_type' => ProjectGoalType::CAPITAL_RECOVERY,
            'goal_target' => fake()->numberBetween(10_000_00, 50_000_00),
            'goal_due_on' => fake()->dateTimeBetween('now', '+1 year'),
            'modules' => ['sales'],
        ];
    }
}
