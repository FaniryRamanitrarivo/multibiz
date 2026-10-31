<?php

namespace App\Domain\Project\Enums;

enum ProjectStatus: string
{
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Actif',
            self::ARCHIVED => 'Archivé',
        };
    }
}
