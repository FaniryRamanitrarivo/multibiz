<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Role;
use App\Domain\Project\Models\Project;

test('owner and manager can create projects', function (Role $role) {
    $user = User::factory()->forOrganization(null, $role)->create();

    expect($user->can('create', Project::class))->toBeTrue();
})->with([Role::Owner, Role::Manager]);

test('entry and viewer cannot create projects', function (Role $role) {
    $user = User::factory()->forOrganization(null, $role)->create();

    expect($user->can('create', Project::class))->toBeFalse();
})->with([Role::Entry, Role::Viewer]);

test('a user with no organization cannot create projects', function () {
    $user = User::factory()->create();

    expect($user->can('create', Project::class))->toBeFalse();
});
