import { setLayoutProps, useForm } from '@inertiajs/react';
import { Bird, Boxes, ShoppingBag, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { WizardStep } from '@/layouts/wizard-layout';
import { store } from '@/routes/projects';
import { CreateProjectProps, ProjectFormData, TemplateIconMap } from '@/types/project';
import { ModelStep } from '@/components/projects/create/model-step';
import { IdentityStep } from '@/components/projects/create/identity-step';
import { GoalStep } from '@/components/projects/create/goal-step';
import { WizardNavigation } from '@/components/projects/create/navigation';
import { ProjectPreview } from '@/components/projects/create/project-preview';
import { restoreFormState, saveFormState } from '@/lib/utils';

const TEMPLATE_ICONS: TemplateIconMap = {
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

export default function CreateProjectPage({
    templates,
    colors,
    takenColors,
    goalTypes,
    modules,
    currency,
}: CreateProjectProps) {

    const STORAGE_KEY = 'project_form';
    const [step, setStep] = useState(1);
    const firstFreeColor =
        colors.find((color) => !takenColors.includes(color.value)) ?? colors[0];

    const initialData: ProjectFormData = {
        name: '',
        project_template: templates[0]?.value ?? '',
        graph_color: firstFreeColor?.value ?? '',
        started_on: new Date().toISOString().slice(0, 10),
        seed_budget: '',
        goal_type: goalTypes[0]?.value ?? '',
        goal_target: '',
        goal_due_on: '',
        modules: templates[0]?.defaultModules ?? [],
    };

    const { data, setData, post, errors, processing } =
        useForm<ProjectFormData>(
            restoreFormState(STORAGE_KEY, initialData)
        );

    useEffect(() => {
        saveFormState(STORAGE_KEY, data);
    }, [data]);

    const template =
        templates.find((item) => item.value === data.project_template) ??
        templates[0];
    const steps: WizardStep[] = STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        return {
            label,
            status:
                stepNumber === step
                    ? 'current'
                    : stepNumber < step
                      ? 'done'
                      : 'upcoming',
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

    const selectTemplate = (value: string) => {
        const selected = templates.find((item) => item.value === value);
        setData((previous) => ({
            ...previous,
            project_template: value,
            modules: selected?.defaultModules ?? [],
        }));
    };

    const toggleModule = (value: string) => {
        setData(
            'modules',
            data.modules.includes(value)
                ? data.modules.filter((module) => module !== value)
                : [...data.modules, value],
        );
    };

    const colorTaken = (value: string) =>
        takenColors.includes(value) && value !== data.graph_color;

    const canContinue = () => {
        if (step === 1) return Boolean(data.project_template);
        if (step === 2) {
            return (
                data.name.trim().length >= 2 &&
                Boolean(data.graph_color) &&
                !colorTaken(data.graph_color) &&
                Boolean(data.started_on) &&
                data.seed_budget !== '' &&
                Number(data.seed_budget) >= 0
            );
        }
        return (
            Boolean(data.goal_type) &&
            data.goal_target !== '' &&
            Number(data.goal_target) >= 0 &&
            Boolean(data.goal_due_on)
        );
    };

    const projectName = data.name.trim() || 'Nouveau projet';

    return (
        <div className="flex flex-wrap items-start gap-5.5">
            <section
                aria-label={heading}
                className="flex min-w-0 flex-[2_1_600px] flex-col gap-5.5 rounded-[18px] border border-border bg-surface p-6.5 shadow-[var(--shadow)]"
            >
                {step === 1 && (
                    <ModelStep
                        templates={templates}
                        selectedTemplate={data.project_template}
                        templateIcons={TEMPLATE_ICONS}
                        onSelectTemplate={selectTemplate}
                    />
                )}
                {step === 2 && (
                    <IdentityStep
                        data={data}
                        errors={errors}
                        colors={colors}
                        currency={currency}
                        takenColors={takenColors}
                        updateField={(key, value) =>
                            setData((previous) => ({
                                ...previous,
                                [key]: value,
                            }))
                        }
                    />
                )}
                {step === 3 && (
                    <GoalStep
                        data={data}
                        errors={errors}
                        goalTypes={goalTypes}
                        modules={modules}
                        template={template}
                        currency={currency}
                        updateField={(key, value) =>
                            setData((previous) => ({
                                ...previous,
                                [key]: value,
                            }))
                        }
                        onToggleModule={toggleModule}
                    />
                )}
                <WizardNavigation
                    step={step}
                    canContinue={canContinue()}
                    processing={processing}
                    projectName={projectName}
                    onPrevious={() => setStep((current) => current - 1)}
                    onNext={() => setStep((current) => current + 1)}
                    onCreate={() => post(store.url())}
                />
            </section>
            <ProjectPreview
                data={data}
                template={template}
                goalTypes={goalTypes}
                currency={currency}
            />
        </div>
    );
}