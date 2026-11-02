import InputError from '@/components/input-error';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { cn, goalUnitLabel } from '@/lib/utils';
import { ModuleOption, Option, ProjectFormData, ProjectFormErrors, ProjectFormUpdate, TemplateOption } from '@/types/project';

export type GoalStepProps = {
    data: ProjectFormData;
    errors: ProjectFormErrors;
    goalTypes: Option[];
    modules: ModuleOption[];
    template?: TemplateOption;
    currency: string;
    updateField: ProjectFormUpdate;
    onToggleModule: (value: string) => void;
};

export function GoalStep({
    data,
    errors,
    goalTypes,
    modules,
    template,
    currency,
    updateField,
    onToggleModule,
}: GoalStepProps) {
    const goalUnit = goalUnitLabel(data.goal_type, currency);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <span id="np-goal" className="text-[13.5px] font-semibold">
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
                            aria-checked={goal.value === data.goal_type}
                            onClick={() => updateField('goal_type', goal.value)}
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
                        <Label htmlFor="np-target">Cible ({goalUnit})</Label>
                        <Input
                            id="np-target"
                            type="number"
                            min={0}
                            className="num h-11.5 rounded-[11px]"
                            value={data.goal_target}
                            onChange={(event) =>
                                updateField('goal_target', event.target.value)
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
                            onChange={(event) =>
                                updateField('goal_due_on', event.target.value)
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
                    const enabled = data.modules.includes(module.value);
                    const suggested =
                        template?.defaultModules.includes(module.value) ??
                        false;

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
                                checked={enabled}
                                onCheckedChange={() =>
                                    onToggleModule(module.value)
                                }
                                aria-label={module.label}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
