<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;

test('a project overview shows its setup and modules', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();
    $project = Project::factory()->for($user->organization)->create([
        'name' => 'Poulets de chair',
        'project_template' => ProjectTemplate::LOTS,
        'seed_budget' => 650_000,
        'goal_type' => ProjectGoalType::CAPITAL_RECOVERY,
        'goal_target' => 1_000_000,
        'modules' => ['lots', 'animals'],
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/show')
            ->where('project.id', $project->id)
            ->where('project.name', 'Poulets de chair')
            ->where('project.template', 'lots')
            ->where('project.templateLabel', ProjectTemplate::LOTS->label())
            ->where('project.seedBudget', 650_000)
            ->where('project.goalTarget', 1_000_000)
            ->where('project.currency', $user->organization->currency->value)
            ->where('project.modules', ['lots', 'animals'])
            ->where('project.moduleLabels', ['Lots / bandes', 'Effectif'])
            ->where('tabs.0.current', true));
});

test('a project overview converts monetary values to major currency units', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();
    $user->organization->update(['currency' => 'EUR']);
    $project = Project::factory()->for($user->organization)->create([
        'seed_budget' => 12_345_67,
        'goal_type' => ProjectGoalType::MARGIN_TARGET,
        'goal_target' => 98_765,
    ]);

    $this->actingAs($user)
        ->get(route('projects.show', $project))
        ->assertInertia(fn ($page) => $page
            ->where('project.seedBudget', 12_345.67)
            ->where('project.goalTarget', 987.65)
            ->where('project.currencyExponent', 2));
});

test('a project cannot be viewed by a user from another organization', function () {
    $owner = User::factory()->forOrganization(null, Role::Owner)->create();
    $otherUser = User::factory()->forOrganization(null, Role::Owner)->create();
    $project = Project::factory()->for($owner->organization)->create();

    $this->actingAs($otherUser)
        ->get(route('projects.show', $project))
        ->assertForbidden();
});
