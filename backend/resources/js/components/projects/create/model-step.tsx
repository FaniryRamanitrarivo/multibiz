import { ChoiceCard } from '@/components/ui/choice-card';
import { TemplateIconMap, TemplateOption } from '@/types/project';


export type ModelStepProps = {
    templates: TemplateOption[];
    selectedTemplate: string;
    templateIcons: TemplateIconMap;
    onSelectTemplate: (value: string) => void;
};

export function ModelStep({
    templates,
    selectedTemplate,
    templateIcons,
    onSelectTemplate,
}: ModelStepProps) {
    return (
        <div className="flex flex-col gap-3.5">
            <div
                role="radiogroup"
                aria-label="Modèle de projet"
                className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
            >
                {templates.map((template) => (
                    <ChoiceCard
                        key={template.value}
                        icon={templateIcons[template.icon]}
                        title={template.label}
                        description={template.description}
                        meta={template.examples.join(', ')}
                        bullets={template.advantages}
                        selected={template.value === selectedTemplate}
                        onSelect={() => onSelectTemplate(template.value)}
                    />
                ))}
            </div>
            <p className="m-0 text-[13.5px] text-muted">
                Pas sûr ? Le modèle ne fait qu&apos;activer des modules par
                défaut : vous pourrez en ajouter ou en retirer dans les réglages
                du projet.
            </p>
        </div>
    );
}
