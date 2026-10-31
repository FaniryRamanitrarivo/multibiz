<?php

namespace App\Domain\Project\Enums;

enum ProjectGoalType: string
{
    case CAPITAL_RECOVERY = 'capital_recovery';
    case MARGIN_TARGET = 'margin_target';
    case SALES_TARGET = 'sales_target';
    case LOSS_LIMIT = 'loss_limit';

    public function label(): string
    {
        return match ($this) {
            self::CAPITAL_RECOVERY => 'Récupérer mon capital',
            self::MARGIN_TARGET => 'Atteindre une marge par bande',
            self::SALES_TARGET => 'Vendre une quantité avant l\'échéance',
            self::LOSS_LIMIT => 'Limiter les pertes ou les invendus',
        };
    }

    /**
     * Whether `goal_target` is a money amount (minor units) for this goal type,
     * rather than a plain count or a percentage.
     */
    public function isMonetary(): bool
    {
        return match ($this) {
            self::CAPITAL_RECOVERY, self::MARGIN_TARGET => true,
            self::SALES_TARGET, self::LOSS_LIMIT => false,
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type) => ['value' => $type->value, 'label' => $type->label()],
            self::cases(),
        );
    }
}
