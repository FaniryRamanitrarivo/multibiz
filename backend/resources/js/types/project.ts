import type { LucideIcon } from 'lucide-react';

export type Option = { value: string; label: string };
export type ModuleOption = Option & { description: string };

export type TemplateOption = {
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

export type CreateProjectProps = {
    templates: TemplateOption[];
    colors: Option[];
    takenColors: string[];
    goalTypes: Option[];
    modules: ModuleOption[];
    currency: string;
};

export type ProjectFormData = {
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

export type ProjectFormUpdate = <Key extends keyof ProjectFormData>(
    key: Key,
    value: ProjectFormData[Key],
) => void;

export type ProjectFormErrors = Partial<
    Record<keyof ProjectFormData, string>
>;

export type TemplateIconMap = Record<string, LucideIcon>; 
