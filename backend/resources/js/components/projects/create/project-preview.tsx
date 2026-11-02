import { ProgressBar } from '@/components/ui/progress-bar';
import { ProjectAvatar } from '@/components/ui/project-avatar';
import { VerdictBadge } from '@/components/ui/verdict-badge';
import { formatAmount, formatDate } from '@/lib/utils';
import { Option, ProjectFormData, TemplateOption } from '@/types/project';


export type ProjectPreviewProps = {
    data: ProjectFormData;
    template?: TemplateOption;
    goalTypes: Option[];
    currency: string;
};

export function ProjectPreview({
    data,
    template,
    goalTypes,
    currency,
}: ProjectPreviewProps) {
    const name = data.name.trim() || 'Nouveau projet';
    const initials = name.slice(0, 2).toLowerCase();
    const goalTarget = Number(data.goal_target || 0);
    const goalLabel =
        goalTypes.find((goal) => goal.value === data.goal_type)?.label ?? '';

    const afterCreation = [
        `Un apport de ${formatAmount(Number(data.seed_budget || 0), currency)} est noté dans « Ma poche », daté du ${formatDate(data.started_on)}.`,
        template?.value === 'simple'
            ? 'Vous noterez vos recettes et dépenses, rien de plus.'
            : `Vous pourrez ajouter votre premier ${(template?.unitQuestion || 'élément').toLowerCase()} dès l'ouverture du projet.`,
        'Le projet apparaît sur le téléphone à la prochaine synchronisation, même hors ligne ensuite.',
    ];

    return (
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
                                ? ` · ${formatAmount(goalTarget, data.goal_type === 'loss_limit' ? '%' : currency)}`
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
    );
}
