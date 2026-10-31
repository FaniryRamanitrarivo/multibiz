<?php

namespace App\Domain\Project\Data;

use Spatie\LaravelData\Data;

class ProjectTemplateData extends Data
{
    public function __construct(
        public readonly string $value,
        public readonly string $label,
        public readonly string $description,
        public readonly string $icon,

        /**
         * @var list<string> Example of business
         */
        public readonly array $examples,

        /**
         * @var list<string> List of the advantages of the project model
         */
        public readonly array $advantages,
        /**
         * "Unit" question in the second step that changes depending on the template. For example, "number of lots" for the LOTS template, "number of animals" for the HERD template, etc.
         */
        public readonly string $unitQuestion,
        /**
         * @var list<string> Default modules to enable when creating a project with this template
         */
        public readonly array $defaultModules,
        /**
         * @var list<string> "Project/show" tabs
         */
        public readonly array $tabs,
    ) {}

}
