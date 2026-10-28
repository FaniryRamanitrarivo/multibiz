<?php

use App\Domain\Identity\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('an authenticated, verified user with an organization can reach the dashboard', function () {
    $user = User::factory()->forOrganization()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()->assertInertia(fn ($page) => $page->component('dashboard/index'));
});

test('a user without an organization is sent to create one', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('organization.create'));
});
