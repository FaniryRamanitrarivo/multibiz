import InputError from '@/components/input-error';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Option, ProjectFormData, ProjectFormErrors, ProjectFormUpdate } from '@/types/project';



export type IdentityStepProps = {
    data: ProjectFormData;
    errors: ProjectFormErrors;
    colors: Option[];
    currency: string;
    takenColors: string[];
    updateField: ProjectFormUpdate;
};

export function IdentityStep({
    data,
    errors,
    colors,
    currency,
    takenColors,
    updateField,
}: IdentityStepProps) {
    const colorTaken = (value: string) =>
        takenColors.includes(value) && value !== data.graph_color;

    return (
        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="np-name">Nom du projet</Label>
                <Input
                    id="np-name"
                    autoFocus
                    className="h-12 rounded-[11px] text-base font-semibold"
                    placeholder="ex. Cailles, Friperie, Lapins"
                    value={data.name}
                    onChange={(event) =>
                        updateField('name', event.target.value)
                    }
                />
                <InputError message={errors.name} />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
                <span id="np-col" className="text-[13.5px] font-semibold">
                    Couleur dans les graphiques
                </span>
                <div
                    role="radiogroup"
                    aria-labelledby="np-col"
                    className="flex flex-wrap gap-2.5"
                >
                    {colors.map((color) => {
                        const selected = color.value === data.graph_color;
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
                                    updateField('graph_color', color.value)
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
                    Les couleurs déjà prises restent réservées à leur projet,
                    pour ne jamais confondre deux courbes.
                </span>
                <InputError message={errors.graph_color} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="np-start">Date de début</Label>
                <DateInput
                    id="np-start"
                    className="h-11.5 rounded-[11px]"
                    value={data.started_on}
                    onChange={(event) =>
                        updateField('started_on', event.target.value)
                    }
                />
                <InputError message={errors.started_on} />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="np-cap">Capital de départ ({currency})</Label>
                <Input
                    id="np-cap"
                    type="number"
                    min={0}
                    step={1000}
                    className="num h-11.5 rounded-[11px]"
                    value={data.seed_budget}
                    onChange={(event) =>
                        updateField('seed_budget', event.target.value)
                    }
                />
                <span className="text-[12.5px] text-muted">
                    Noté comme un apport de votre poche, pas comme une dépense.
                </span>
                <InputError message={errors.seed_budget} />
            </div>
        </div>
    );
}
