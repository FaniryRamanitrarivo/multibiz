import { setLayoutProps, useForm } from '@inertiajs/react';
import {
    Bird,
    Boxes,
    type LucideIcon,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { ChoiceCard } from '@/components/ui/choice-card';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ProjectAvatar } from '@/components/ui/project-avatar';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { cn } from '@/lib/utils';
import type { WizardStep } from '@/layouts/wizard-layout';
import { store } from '@/routes/projects';

type Option = { value: string; label: string };
type ModuleOption = Option & { description: string };
type TemplateOption = {
    value: string;
    label: string;
    description: string;
    icon: string;
    examples: string[];
    advantages: string[];
    unitQuestion: string;
    defaultModules: string[];
    tabs: string[];
};

type Props = {
    // From App\Domain\Project\Enums\ProjectTemplate::definitions().
    templates: TemplateOption[];
    // From App\Domain\Project\Enums\ProjectColor::options().
    colors: Option[];
    takenColors: string[];
    // From App\Domain\Project\Enums\ProjectGoalType::options().
    goalTypes: Option[];
    // From App\Domain\Project\Enums\ProjectModule::catalog().
    modules: ModuleOption[];
    currency: string;
};

type ProjectFormData = {
    name: string;
    project_template: string;
    graph_color: string;
    started_on: string;
    seed_budget: string;
    goal_type: string;
    goal_target: string;
    goal_due_on: string;
    modules: string[];
};

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
    lots: Boxes,
    herd: Bird,
    resale: ShoppingBag,
    simple: Wallet,
};

const STEP_LABELS = ['Modèle', 'Identité', 'Objectif'];

const HEADINGS: Record<number, [string, string]> = {
    1: [
        'Quel genre de projet lancez-vous ?',
        "Le modèle décide de ce que MultiBiz suit pour vous. Choisissez le plus proche, pas besoin qu'il soit parfait.",
    ],
    2: [
        "Comment s'appelle-t-il ?",
        "Le nom, la couleur et l'argent de départ. Le capital sert à calculer combien le projet vous a déjà rendu.",
    ],
    3: [
        "Qu'est-ce qui dira que ça marche ?",
        'Un objectif daté, et les modules à activer. Tout reste modifiable ensuite.',
    ],
};

const THIN_SPACE = ' ';

function formatAmount(amount: number, currency: string): string {
    const grouped = Math.round(Math.abs(amount))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);

    return currency === 'MGA'
        ? `${grouped}${THIN_SPACE}Ar`
        : `${grouped}${THIN_SPACE}${currency}`;
}

function goalUnitLabel(goalType: string, currency: string): string {
    switch (goalType) {
        case 'capital_recovery':
        case 'margin_target':
            return currency === 'MGA' ? 'Ar' : currency;
        case 'loss_limit':
            return '%';
        default:
            return 'unités';
    }
}

export default function CreateProject({
    templates,
    colors,
    takenColors,
    goalTypes,
    modules,
    currency,
}: Props) {
    const [step, setStep] = useState(1);

    const firstFreeColor =
        colors.find((color) => !takenColors.includes(color.value)) ?? colors[0];

    const { data, setData, post, errors, processing } =
        useForm<ProjectFormData>({
            name: '',
            project_template: templates[0]?.value ?? '',
            graph_color: firstFreeColor?.value ?? '',
            started_on: new Date().toISOString().slice(0, 10),
            seed_budget: '',
            goal_type: goalTypes[0]?.value ?? '',
            goal_target: '',
            goal_due_on: '',
            modules: templates[0]?.defaultModules ?? [],
        });

    const template =
        templates.find((t) => t.value === data.project_template) ??
        templates[0];

    // Plain data only (no per-item closures) — setLayoutProps deep-equality-
    // checks its props before notifying listeners, and the React Compiler
    // here strips out manual useMemo wrappers, so a fresh closure per item
    // would never compare equal and would loop forever. `onSelectStep` below
    // covers the interaction with one stable callback instead.
    const steps: WizardStep[] = STEP_LABELS.map((label, index) => {
        const n = index + 1;

        return {
            label,
            status: n === step ? 'current' : n < step ? 'done' : 'upcoming',
        };
    });

    const [heading, subtitle] = HEADINGS[step];

    setLayoutProps({
        eyebrow: `// nouveau projet · étape ${step} sur 3`,
        title: heading,
        subtitle,
        steps,
        onSelectStep: setStep,
    });

    function selectTemplate(value: string) {
        const picked = templates.find((t) => t.value === value);

        setData((previous) => ({
            ...previous,
            project_template: value,
            modules: picked?.defaultModules ?? [],
        }));
    }

    function toggleModule(value: string) {
        setData(
            'modules',
            data.modules.includes(value)
                ? data.modules.filter((m) => m !== value)
                : [...data.modules, value],
        );
    }

    function colorTaken(value: string): boolean {
        return takenColors.includes(value) && value !== data.graph_color;
    }

    function canContinue(): boolean {
        if (step === 1) {
            return !!data.project_template;
        }

        if (step === 2) {
            return (
                data.name.trim().length >= 2 &&
                !!data.graph_color &&
                !colorTaken(data.graph_color) &&
                !!data.started_on &&
                data.seed_budget !== '' &&
                Number(data.seed_budget) >= 0
            );
        }

        return (
            !!data.goal_type &&
            data.goal_target !== '' &&
            Number(data.goal_target) >= 0 &&
            !!data.goal_due_on
        );
    }

    const name = data.name.trim() || 'Nouveau projet';
    const initials = name.slice(0, 2).toLowerCase();
    const goalUnit = goalUnitLabel(data.goal_type, currency);
    const goalTargetNumber = Number(data.goal_target || 0);
    const goalLabel =
        goalTypes.find((g) => g.value === data.goal_type)?.label ?? '';

    const afterCreation = [
        `Un apport de ${formatAmount(Number(data.seed_budget || 0), currency)} est noté dans « Ma poche », daté du ${formatDate(data.started_on)}.`,
        template?.value === 'simple'
            ? 'Vous noterez vos recettes et dépenses, rien de plus.'
            : `Vous pourrez ajouter votre premier ${template?.unitQuestion ? template.unitQuestion.toLowerCase() : 'élément'} dès l'ouverture du projet.`,
        'Le projet apparaît sur le téléphone à la prochaine synchronisation, même hors ligne ensuite.',
    ];

    return (
        <div className="flex flex-wrap items-start gap-5.5">
            <section
                aria-label={heading}
                className="flex min-w-0 flex-[2_1_600px] flex-col gap-5.5 rounded-[18px] border border-border bg-surface p-6.5 shadow-[var(--shadow)]"
            >
                {step === 1 && (
                    <div className="flex flex-col gap-3.5">
                        <div
                            role="radiogroup"
                            aria-label="Modèle de projet"
                            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
                        >
                            {templates.map((t) => (
                                <ChoiceCard
                                    key={t.value}
                                    icon={TEMPLATE_ICONS[t.icon]}
                                    title={t.label}
                                    description={t.description}
                                    meta={t.examples.join(', ')}
                                    bullets={t.advantages}
                                    selected={t.value === data.project_template}
                                    onSelect={() => selectTemplate(t.value)}
                                />
                            ))}
                        </div>
                        <p className="m-0 text-[13.5px] text-muted">
                            Pas sûr ? Le modèle ne fait qu&apos;activer des
                            modules par défaut : vous pourrez en ajouter ou en
                            retirer dans les réglages du projet.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <Label htmlFor="np-name">Nom du projet</Label>
                            <Input
                                id="np-name"
                                autoFocus
                                className="h-12 rounded-[11px] text-base font-semibold"
                                placeholder="ex. Cailles, Friperie, Lapins"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <span
                                id="np-col"
                                className="text-[13.5px] font-semibold"
                            >
                                Couleur dans les graphiques
                            </span>
                            <div
                                role="radiogroup"
                                aria-labelledby="np-col"
                                className="flex flex-wrap gap-2.5"
                            >
                                {colors.map((color) => {
                                    const selected =
                                        color.value === data.graph_color;
                                    const taken = colorTaken(color.value);

                                    return (
                                        <button
                                            key={color.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            aria-label={color.label}
                                            disabled={taken}
                                            onClick={() =>
                                                setData(
                                                    'graph_color',
                                                    color.value,
                                                )
                                            }
                                            className={cn(
                                                'flex h-10 items-center gap-2 rounded-[10px] py-0 pr-3 pl-2 disabled:cursor-not-allowed disabled:opacity-55',
                                                selected
                                                    ? 'bg-primary-soft shadow-[inset_0_0_0_2px_var(--primary)]'
                                                    : 'border border-border',
                                            )}
                                        >
                                            <span
                                                className="size-5.5 rounded-[7px]"
                                                style={{
                                                    background: `var(--${color.value})`,
                                                }}
                                            />
                                            <span className="text-[12.5px] text-muted">
                                                {taken ? 'prise' : color.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-[12.5px] text-muted">
                                Les couleurs déjà prises restent réservées à
                                leur projet, pour ne jamais confondre deux
                                courbes.
                            </span>
                            <InputError message={errors.graph_color} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="np-start">Date de début</Label>
                            <DateInput
                                id="np-start"
                                className="h-11.5 rounded-[11px]"
                                value={data.started_on}
                                onChange={(e) =>
                                    setData('started_on', e.target.value)
                                }
                            />
                            <InputError message={errors.started_on} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="np-cap">
                                Capital de départ ({currency})
                            </Label>
                            <Input
                                id="np-cap"
                                type="number"
                                min={0}
                                step={1000}
                                className="num h-11.5 rounded-[11px]"
                                value={data.seed_budget}
                                onChange={(e) =>
                                    setData('seed_budget', e.target.value)
                                }
                            />
                            <span className="text-[12.5px] text-muted">
                                Noté comme un apport de votre poche, pas comme
                                une dépense.
                            </span>
                            <InputError message={errors.seed_budget} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <span
                                id="np-goal"
                                className="text-[13.5px] font-semibold"
                            >
                                Objectif principal
                            </span>
                            <div
                                role="radiogroup"
                                aria-labelledby="np-goal"
                                className="grid grid-cols-2 gap-2.5"
                            >
                                {goalTypes.map((goal) => (
                                    <button
                                        key={goal.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={
                                            goal.value === data.goal_type
                                        }
                                        onClick={() =>
                                            setData('goal_type', goal.value)
                                        }
                                        className={cn(
                                            'flex flex-col gap-0.5 rounded-xl p-3.5 text-left text-sm font-semibold',
                                            goal.value === data.goal_type
                                                ? 'bg-primary-soft shadow-[inset_0_0_0_2px_var(--primary)]'
                                                : 'shadow-[inset_0_0_0_1px_var(--border)]',
                                        )}
                                    >
                                        {goal.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="np-target">
                                        Cible ({goalUnit})
                                    </Label>
                                    <Input
                                        id="np-target"
                                        type="number"
                                        min={0}
                                        className="num h-11.5 rounded-[11px]"
                                        value={data.goal_target}
                                        onChange={(e) =>
                                            setData(
                                                'goal_target',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.goal_target} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="np-dl">Échéance</Label>
                                    <DateInput
                                        id="np-dl"
                                        className="h-11.5 rounded-[11px]"
                                        value={data.goal_due_on}
                                        onChange={(e) =>
                                            setData(
                                                'goal_due_on',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={errors.goal_due_on} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline justify-between gap-2.5 border-b border-border pb-1.5">
                                <span className="text-[13.5px] font-semibold">
                                    Modules activés
                                </span>
                                <span className="num text-xs text-muted">
                                    {data.modules.length} sur {modules.length}
                                </span>
                            </div>
                            {modules.map((module) => {
                                const on = data.modules.includes(module.value);
                                const suggested = (
                                    template?.defaultModules ?? []
                                ).includes(module.value);

                                return (
                                    <div
                                        key={module.value}
                                        className="flex items-center gap-3.5 border-t border-border py-2.5 first:border-t-0"
                                    >
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="flex items-center gap-2 text-sm font-semibold">
                                                {module.label}
                                                {suggested && (
                                                    <VerdictBadge tone="primary">
                                                        conseillé
                                                    </VerdictBadge>
                                                )}
                                            </span>
                                            <span className="text-[12.5px] text-muted">
                                                {module.description}
                                            </span>
                                        </span>
                                        <Switch
                                            checked={on}
                                            onCheckedChange={() =>
                                                toggleModule(module.value)
                                            }
                                            aria-label={module.label}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4.5">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}
                    >
                        ← Retour
                    </Button>

                    {step < 3 ? (
                        <Button
                            type="button"
                            disabled={!canContinue()}
                            onClick={() => setStep(step + 1)}
                        >
                            Continuer
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled={!canContinue() || processing}
                            onClick={() => post(store.url())}
                            className="gap-2"
                        >
                            {processing && <Spinner />}
                            Créer « {name} »
                        </Button>
                    )}
                </div>
            </section>

            <aside
                aria-label="Aperçu du projet"
                className="flex min-w-0 flex-1 basis-[340px] flex-col gap-3.5"
            >
                <span className="num text-xs text-muted">
                    // aperçu sur la vue d&apos;ensemble
                </span>
                <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-4.5 shadow-[var(--shadow)]">
                    <div className="flex items-center gap-3">
                        <ProjectAvatar
                            initials={initials}
                            color={`var(--${data.graph_color || 'b1'})`}
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-base font-bold tracking-[-0.02em]">
                                {name}
                            </span>
                            <span className="text-[12.5px] text-muted">
                                {template?.label} · dès le{' '}
                                {formatDate(data.started_on)}
                            </span>
                        </span>
                        <VerdictBadge tone="primary" className="shrink-0">
                            En démarrage
                        </VerdictBadge>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="num flex justify-between text-[12.5px] text-muted">
                            <span>Capital récupéré</span>
                            <span>
                                0 /{' '}
                                {formatAmount(
                                    Number(data.seed_budget || 0),
                                    currency,
                                )}
                            </span>
                        </div>
                        <ProgressBar value={2} />
                    </div>

                    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg p-3">
                        <div className="flex justify-between gap-2">
                            <span className="text-sm font-semibold">
                                {goalLabel}
                                {data.goal_target !== ''
                                    ? ` · ${formatAmount(goalTargetNumber, data.goal_type === 'loss_limit' ? '%' : currency)}`
                                    : ''}
                            </span>
                            <VerdictBadge tone="slate" className="shrink-0">
                                À venir
                            </VerdictBadge>
                        </div>
                        <span className="num text-xs text-muted">
                            {data.goal_due_on
                                ? `avant le ${formatDate(data.goal_due_on)}`
                                : 'échéance à définir'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {[...(template?.tabs ?? []), 'Réglages'].map((tab) => (
                            <span
                                key={tab}
                                className="rounded-lg border border-border px-2.5 py-1 text-xs text-text2"
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 rounded-[14px] bg-primary-soft p-4">
                    <span className="text-[13.5px] font-bold text-primary-text">
                        Ce qui se passe à la création
                    </span>
                    {afterCreation.map((text, index) => (
                        <span
                            key={index}
                            className="flex gap-2.5 text-[13px] leading-relaxed text-text2"
                        >
                            <span className="num shrink-0 text-xs text-primary-text">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            {text}
                        </span>
                    ))}
                </div>
            </aside>
        </div>
    );
}

function formatDate(iso: string): string {
    if (!iso) {
        return '—';
    }

    const date = new Date(`${iso}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
