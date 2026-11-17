import { Head } from '@inertiajs/react';
import {
    Bird,
    Boxes,
    CalendarDays,
    CircleDollarSign,
    ShoppingBag,
    Wallet,
    type LucideIcon,
} from 'lucide-react';

import { ProjectHeader } from '@/components/project-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatTile } from '@/components/ui/stat-tile';
import { formatAmount, formatDate, goalUnitLabel } from '@/lib/utils';

type ProjectTemplate = 'lots' | 'herd' | 'resale' | 'simple';

interface ProjectOverview {
    id: string;
    name: string;
    color: string;
    status: 'active' | 'archived';
    statusLabel: string;
    template: ProjectTemplate;
    templateLabel: string;
    startedOn: string;
    seedBudget: number;
    goalType: string;
    goalTypeLabel: string;
    goalTarget: number;
    goalDueOn: string;
    modules: string[];
    moduleLabels: string[];
    currency: string;
    currencyExponent: number;
    creator: { id: number; name: string } | null;
}

interface ProjectShowProps {
    project: ProjectOverview;
    tabs: { label: string; href: string; current: boolean }[];
}

const TRACKING_BY_TEMPLATE: Record<
    ProjectTemplate,
    { title: string; module: string; description: string; icon: LucideIcon }
> = {
    lots: {
        title: 'Suivi par lots',
        module: 'lots',
        description:
            'Les effectifs, pertes et résultats de chaque lot apparaîtront ici.',
        icon: Boxes,
    },
    herd: {
        title: 'Suivi de l’effectif',
        module: 'animals',
        description:
            'Les évolutions de l’effectif et les données de production apparaîtront ici.',
        icon: Bird,
    },
    resale: {
        title: 'Suivi du stock',
        module: 'stock',
        description:
            'Les produits en stock et les ventes apparaîtront ici.',
        icon: ShoppingBag,
    },
    simple: {
        title: 'Suivi de l’activité',
        module: 'sales',
        description:
            'Les recettes et dépenses de votre activité apparaîtront ici.',
        icon: Wallet,
    },
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
}

function formatGoalTarget(project: ProjectOverview): string {
    const isMonetary =
        project.goalType === 'capital_recovery' ||
        project.goalType === 'margin_target';

    if (isMonetary) {
        return formatAmount(
            project.goalTarget,
            project.currency,
            project.currencyExponent,
        );
    }

    const unit = goalUnitLabel(project.goalType, project.currency);

    return `${formatNumber(project.goalTarget)} ${unit}`;
}

export default function ProjectShow({ project, tabs }: ProjectShowProps) {
    const tracking = TRACKING_BY_TEMPLATE[project.template];
    const TrackingIcon = tracking.icon;
    const trackingEnabled = project.modules.includes(tracking.module);
    const statusTone = project.status === 'active' ? 'primary' : 'slate';
    const meta = [
        `depuis le ${formatDate(project.startedOn)}`,
        project.statusLabel,
        project.creator ? `créé par ${project.creator.name}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <>
            <Head title={project.name} />
            <div className="flex flex-col gap-5">
                <ProjectHeader
                    backHref="/dashboard"
                    backLabel="Tous les projets"
                    name={project.name}
                    color={project.color}
                    verdictLabel="À compléter"
                    verdictTone={statusTone}
                    modelLabel={project.templateLabel}
                    meta={meta}
                    tabs={tabs}
                />

                <section
                    aria-label="Résumé du projet"
                    className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    <StatTile
                        label="Capital de départ"
                        value={formatAmount(
                            project.seedBudget,
                            project.currency,
                            project.currencyExponent,
                        )}
                        sub={`Depuis le ${formatDate(project.startedOn)}`}
                    />
                    <StatTile
                        label="Résultat cumulé"
                        value="—"
                        sub="En attente des premiers flux"
                    />
                    <StatTile
                        label="Capital récupéré"
                        value="—"
                        sub="Calculé à partir des flux enregistrés"
                    />
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Objectif principal
                            </CardTitle>
                            <p className="m-0 text-sm text-muted">
                                {project.goalTypeLabel}
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-end justify-between gap-4">
                            <p className="num m-0 text-2xl font-semibold">
                                {formatGoalTarget(project)}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted">
                                <CalendarDays aria-hidden="true" size={16} />
                                <span>
                                    Échéance : {formatDate(project.goalDueOn)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrackingIcon
                                    aria-hidden="true"
                                    className="size-4 text-primary-text"
                                />
                                <CardTitle className="text-base">
                                    {tracking.title}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3 rounded-xl border border-border bg-bg p-4">
                                <CircleDollarSign
                                    aria-hidden="true"
                                    className="mt-0.5 size-5 shrink-0 text-muted"
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="m-0 text-sm font-medium">
                                        {trackingEnabled
                                            ? 'Aucune donnée enregistrée'
                                            : 'Module non activé'}
                                    </p>
                                    <p className="m-0 text-sm leading-relaxed text-muted">
                                        {trackingEnabled
                                            ? tracking.description
                                            : 'Activez ce module dans les réglages du projet pour suivre ces données.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Modules du projet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.moduleLabels.length > 0 ? (
                            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                                {project.moduleLabels.map((label) => (
                                    <li
                                        key={label}
                                        className="rounded-full border border-border px-3 py-1 text-sm text-text2"
                                    >
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="m-0 text-sm text-muted">
                                Aucun module n’est activé pour ce projet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProjectShow.layout = {
    headTitle: 'Projet',
    mainTitle: 'Vue d’ensemble',
};
