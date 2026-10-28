<?php

namespace Database\Factories;

use App\Domain\Organization\Enums\Currency;
use App\Domain\Organization\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'currency' => Currency::MGA,
            'timezone' => 'Indian/Antananarivo',
        ];
    }
}
