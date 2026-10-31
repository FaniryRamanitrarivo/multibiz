<?php

namespace App\Domain\Project\Enums;

/**
 * The catalog of modules a project can enable (`projects.modules`). Which ones are
 * on by default depends on the chosen `ProjectTemplate` (see its `defaultModules`)
 * — the user can still turn any of them on or off in step 3 of the wizard, and
 * later from the project's settings.
 */
enum ProjectModule: string
{
    case LOTS = 'lots';
    case ANIMALS = 'animals';
    case WEIGHT = 'weight';
    case SALES = 'sales';
    case STOCK = 'stock';

    public function label(): string
    {
        return match ($this) {
            self::LOTS => 'Lots / bandes',
            self::ANIMALS => 'Effectif',
            self::WEIGHT => 'Pesées',
            self::SALES => 'Ventes',
            self::STOCK => 'Ressources et stock',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::LOTS => 'Début, fin, effectif et marge de chaque bande',
            self::ANIMALS => 'Entrées, pertes et réformes de l\'effectif',
            self::WEIGHT => 'Suivi du poids et de la croissance',
            self::SALES => 'Quantités et montants vendus',
            self::STOCK => 'Achats mis en stock, coût ajouté à l\'usage',
        };
    }

    /**
     * @return list<array{value: string, label: string, description: string}>
     */
    public static function catalog(): array
    {
        return array_map(
            fn (self $module) => [
                'value' => $module->value,
                'label' => $module->label(),
                'description' => $module->description(),
            ],
            self::cases(),
        );
    }
}
