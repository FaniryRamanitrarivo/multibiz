<?php

namespace App\Domain\Project\Data;

use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectTemplate;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Mappers\SnakeCaseMapper;

#[MapInputName(SnakeCaseMapper::class)]
class ProjectData extends Data
{
    public function __construct(
        public string $name,
        public ProjectTemplate $projectTemplate,
        public ProjectColor $graphColor,
        public string $startedOn,

        /**
         * Capital de départ, in major units (e.g. Ar, not minor units) — converted
         * to minor units in `CreateProject` using the organization's currency.
         */
        public float $seedBudget,
        public ProjectGoalType $goalType,

        /**
         * In major units for a monetary goal type, a plain count or a percentage
         * otherwise — see `ProjectGoalType::isMonetary()`.
         */
        public float $goalTarget,
        public string $goalDueOn,

        /** @var list<string> */
        public array $modules,
    ) {}
}
