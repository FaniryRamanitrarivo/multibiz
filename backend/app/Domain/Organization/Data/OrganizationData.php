<?php

namespace App\Domain\Organization\Data;

use App\Domain\Organization\Enums\Currency;
use Spatie\LaravelData\Data;

class OrganizationData extends Data
{
    public function __construct(
        public string $name,
        public Currency $currency = Currency::MGA,
        public string $timezone = 'Indian/Antananarivo',
    ) {}
}
