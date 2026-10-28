<?php

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Enums\Currency;

test('the create organization page lists the supported currencies', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('organization.create'));

    $response->assertOk()->assertInertia(fn ($page) => $page
        ->component('organization/create')
        ->where('currencies', Currency::options())
    );
});
