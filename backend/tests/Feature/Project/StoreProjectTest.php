<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Currency;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;
use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;

function validProjectInput(array $overrides = []): array
{
    return [
        'name' => 'Cailles',
        'project_template' => ProjectTemplate::LOTS->value,
        'graph_color' => ProjectColor::B1->value,
        'started_on' => '2026-10-12',
        'seed_budget' => 300000,
        'goal_type' => ProjectGoalType::CAPITAL_RECOVERY->value,
        'goal_target' => 300000,
        'goal_due_on' => '2027-03-31',
        'modules' => ['lots', 'animals'],
        ...$overrides,
    ];
}

test('creating a project stores it under the owner\'s organization', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $response = $this->actingAs($user)->post(route('projects.store'), validProjectInput());

    $response->assertRedirect(route('dashboard'));

    $project = Project::sole();

    expect($project->organization_id)->toBe($user->organization_id)
        ->and($project->created_by)->toBe($user->id)
        ->and($project->name)->toBe('Cailles')
        ->and($project->project_template)->toBe(ProjectTemplate::LOTS)
        ->and($project->graph_color)->toBe(ProjectColor::B1)
        ->and($project->started_on->toDateString())->toBe('2026-10-12')
        ->and($project->seed_budget)->toBe(300000)
        ->and($project->goal_type)->toBe(ProjectGoalType::CAPITAL_RECOVERY)
        ->and($project->goal_target)->toBe(300000)
        ->and($project->goal_due_on->toDateString())->toBe('2027-03-31')
        ->and($project->modules)->toBe(['lots', 'animals']);
});

test('the seed budget and a monetary goal target are converted using the organization currency', function () {
    $organization = Organization::factory()->create(['currency' => Currency::EUR]);
    $user = User::factory()->forOrganization($organization, Role::Owner)->create();

    $this->actingAs($user)->post(route('projects.store'), validProjectInput([
        'seed_budget' => 150.50,
        'goal_target' => 1000,
    ]))->assertRedirect(route('dashboard'));

    $project = Project::sole();

    expect($project->seed_budget)->toBe(15050)
        ->and($project->goal_target)->toBe(100000);
});

test('a non-monetary goal target (e.g. a loss percentage) is stored as a plain number', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $this->actingAs($user)->post(route('projects.store'), validProjectInput([
        'goal_type' => ProjectGoalType::LOSS_LIMIT->value,
        'goal_target' => 5,
    ]))->assertRedirect(route('dashboard'));

    expect(Project::sole()->goal_target)->toBe(5);
});

test('a color already used in the organization cannot be reused', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();
    Project::factory()->for($user->organization)->create(['graph_color' => ProjectColor::B1]);

    $this->actingAs($user)
        ->post(route('projects.store'), validProjectInput(['graph_color' => ProjectColor::B1->value]))
        ->assertSessionHasErrors('graph_color');

    expect(Project::count())->toBe(1);
});

test('the same color can be used by different organizations', function () {
    Project::factory()->create(['graph_color' => ProjectColor::B1]);
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $this->actingAs($user)
        ->post(route('projects.store'), validProjectInput(['graph_color' => ProjectColor::B1->value]))
        ->assertRedirect(route('dashboard'));

    expect(Project::count())->toBe(2);
});

test('the deadline must be after the start date', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $this->actingAs($user)
        ->post(route('projects.store'), validProjectInput([
            'started_on' => '2026-10-12',
            'goal_due_on' => '2026-10-01',
        ]))
        ->assertSessionHasErrors('goal_due_on');

    expect(Project::count())->toBe(0);
});

test('invalid input is rejected', function (array $overrides, string $field) {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $this->actingAs($user)
        ->post(route('projects.store'), validProjectInput($overrides))
        ->assertSessionHasErrors($field);

    expect(Project::count())->toBe(0);
})->with([
    'missing name' => [['name' => ''], 'name'],
    'unknown template' => [['project_template' => 'nope'], 'project_template'],
    'unknown color' => [['graph_color' => 'b9'], 'graph_color'],
    'negative seed budget' => [['seed_budget' => -1], 'seed_budget'],
    'unknown goal type' => [['goal_type' => 'nope'], 'goal_type'],
    'loss percentage over 100' => [['goal_type' => 'loss_limit', 'goal_target' => 101], 'goal_target'],
    'unknown module' => [['modules' => ['not-a-module']], 'modules.0'],
]);

test('entry and viewer roles cannot create a project', function (Role $role) {
    $user = User::factory()->forOrganization(null, $role)->create();

    $this->actingAs($user)->post(route('projects.store'), validProjectInput())->assertForbidden();

    expect(Project::count())->toBe(0);
})->with([Role::Entry, Role::Viewer]);

test('guests cannot create a project', function () {
    $this->post(route('projects.store'), validProjectInput())->assertRedirect(route('login'));
});
