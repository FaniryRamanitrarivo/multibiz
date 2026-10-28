<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Currency;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

function validOrganizationInput(array $overrides = []): array
{
    return [
        'name' => 'Famille Rakoto',
        'timezone' => 'Indian/Antananarivo',
        'currency' => 'MGA',
        ...$overrides,
    ];
}

test('creating an organization makes the user its owner', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('organization.store'), validOrganizationInput());

    $response->assertRedirect(route('dashboard'));

    $organization = Organization::sole();
    $user->refresh();

    expect($organization->name)->toBe('Famille Rakoto')
        ->and($organization->currency)->toBe(Currency::MGA)
        ->and($organization->timezone)->toBe('Indian/Antananarivo')
        ->and($user->organization_id)->toBe($organization->id)
        ->and($user->role)->toBe(Role::Owner);
});

test('a backward-compat timezone alias from the browser list is accepted', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('organization.store'), validOrganizationInput(['timezone' => 'Asia/Calcutta']))
        ->assertRedirect(route('dashboard'));
});

test('a user who already has an organization cannot create another', function () {
    $user = User::factory()->forOrganization()->create();

    $this->actingAs($user)
        ->post(route('organization.store'), validOrganizationInput())
        ->assertRedirect(route('dashboard'));

    expect(Organization::count())->toBe(1);
});

test('a user who already has an organization is sent away from the create page', function () {
    $user = User::factory()->forOrganization()->create();

    $this->actingAs($user)
        ->get(route('organization.create'))
        ->assertRedirect(route('dashboard'));
});

test('invalid input is rejected', function (array $overrides, string $field) {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('organization.store'), validOrganizationInput($overrides))
        ->assertSessionHasErrors($field);

    expect(Organization::count())->toBe(0);
})->with([
    'missing name' => [['name' => ''], 'name'],
    'unknown timezone' => [['timezone' => 'Mars/Olympus'], 'timezone'],
    'unsupported currency' => [['currency' => 'JPY'], 'currency'],
]);

test('guests cannot create an organization', function () {
    $this->post(route('organization.store'), validOrganizationInput())
        ->assertRedirect(route('login'));
});
