<?php

namespace App\Domain\Project\Enums;

/**
 * The 6 colors a project can be identified by in charts (`--b1` to `--b6` in
 * tokens.css). A color is reserved to its project for good once chosen — see
 * `ProjectRequest` for the per-organization uniqueness check.
 */
enum ProjectColor: string
{
    case B1 = 'b1';
    case B2 = 'b2';
    case B3 = 'b3';
    case B4 = 'b4';
    case B5 = 'b5';
    case B6 = 'b6';

    public function label(): string
    {
        return match ($this) {
            self::B1 => 'Ambre',
            self::B2 => 'Rose',
            self::B3 => 'Cyan',
            self::B4 => 'Violet',
            self::B5 => 'Olive',
            self::B6 => 'Ardoise',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $color) => ['value' => $color->value, 'label' => $color->label()],
            self::cases(),
        );
    }
}
