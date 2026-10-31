<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectModule;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;

test('the create project page lists templates, colors, goal types, and modules', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();

    $response = $this->actingAs($user)->get(route('projects.create'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('projects/create')
        ->where('colors', ProjectColor::options())
        ->where('goalTypes', ProjectGoalType::options())
        ->where('modules', ProjectModule::catalog())
        ->where('takenColors', [])
        ->where('currency', $user->organization->currency->value)
        ->has('templates', count(ProjectTemplate::cases())));
});

test('colors already used by the organization are reported as taken', function () {
    $user = User::factory()->forOrganization(null, Role::Owner)->create();
    Project::factory()->for($user->organization)->create(['graph_color' => ProjectColor::B2]);

    $response = $this->actingAs($user)->get(route('projects.create'));

    $response->assertInertia(fn ($page) => $page->where('takenColors', [ProjectColor::B2->value]));
});

test('entry and viewer roles cannot reach the create project page', function (Role $role) {
    $user = User::factory()->forOrganization(null, $role)->create();

    $this->actingAs($user)->get(route('projects.create'))->assertForbidden();
})->with([Role::Entry, Role::Viewer]);

test('a user without an organization is sent to create one', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('projects.create'))->assertRedirect(route('organization.create'));
});
