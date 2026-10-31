<?php

namespace App\Domain\Project\Enums;

use App\Domain\Project\Data\ProjectTemplateData;

enum ProjectTemplate: string
{
    case LOTS = 'lots';
    case HERD = 'herd';
    case RESALE = 'resale';
    case SIMPLE = 'simple';

    public function label(): string
    {
        return match ($this) {
            self::LOTS => 'élevage en lots',
            self::HERD => 'élevage par effectif',
            self::RESALE => 'revente avec stock',
            self::SIMPLE => 'simple',
        };
    }

    public function definition(): ProjectTemplateData
    {
        return match ($this) {
            self::LOTS => new ProjectTemplateData(
                value: $this->value,
                label: $this->label(),
                description: 'Chaque bande a un début, une fin et un coût par tête. Idéal pour comparer les bandes entre elles.',
                icon: 'lots',
                examples: [
                    'Poulets de chair',
                    'Cailles',
                    'Porcs d\'engraissement',
                ],
                advantages: [
                    'Coût et marge de chaque bande',
                    'Pertes et pesées',
                    'Recette type pour planifier la suivante',
                ],
                unitQuestion: 'Nombre de lots',
                defaultModules: ['lots', 'animals', 'weight', 'sales'],
                tabs: ['dashboard', 'lots', 'animals', 'weight', 'sales'],
            ),
            self::HERD => new ProjectTemplateData(
                value: $this->value,
                label: $this->label(),
                description: 'Un troupeau qui vit en continu. On suit l\'effectif et ce qu\'il produit chaque jour',
                icon: 'herd',
                examples: [
                    'poules pondeuses',
                    'lapins',
                    'vaches laitières',
                ],
                advantages: [
                    'Effectifs: entrées, pertes, réformes',
                    'Production par jour et taux',
                    'Coût par œuf, par litre ou par kg',
                ],
                unitQuestion: 'Nombre d’animaux',
                defaultModules: ['animals', 'weight', 'sales'],
                tabs: ['dashboard', 'animals', 'weight', 'sales'],
            ),
            self::RESALE => new ProjectTemplateData(
                value: $this->value,
                label: $this->label(),
                description: 'Acheter, stocker, revendre. on suit la marge de chaque produit et ce qui dort en stock',
                icon: 'resale',
                examples: [
                    'Téléphones',
                    'Ecouteurs',
                    'Vêtements',
                ],
                advantages: [
                    'Marge par produit',
                    'Stock qui dort et ruptures',
                    'Ventes par semaine et par canal',
                ],
                unitQuestion: 'Nombre de produits',
                defaultModules: ['stock', 'sales'],
                tabs: ['dashboard', 'stock', 'sales'],
            ),
            self::SIMPLE => new ProjectTemplateData(
                value: $this->value,
                label: $this->label(),
                description: 'Juste des entrées et des sorties d\'argent. Des modules s\'ajoutent plus tard si besoin.',
                icon: 'simple',
                examples: [
                    'Service',
                    'Petites missions',
                    'Location',
                ],
                advantages: [
                    'Recettes et dépenses',
                    'Résultat par mois',
                    'Temps passé et rendement par heure',
                ],
                unitQuestion: '',
                defaultModules: ['sales'],
                tabs: ['dashboard', 'sales'],
            ),
        };
    }

    /**
     * @return list<ProjectTemplateData>
     */
    public static function definitions(): array
    {
        return array_map(
            fn (self $template) => $template->definition(),
            self::cases(),
        );
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $template) => ['value' => $template->value, 'label' => $template->label()],
            self::cases(),
        );
    }
}
