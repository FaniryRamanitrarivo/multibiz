import { NavItem, NavSidebar } from "@/components/nav-sidebar";
import { PageHeader } from "@/components/page-header";
import Section from "@/components/section";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Head } from "@inertiajs/react";
import { BarChart3, CheckSquare, History, LayoutGrid, Settings, Wallet } from "lucide-react";
import { ReactNode } from "react";
import project from '@/routes/projects';

const NAV_ITEMS: NavItem[] = [
    { label: "Vue d'ensemble", href: '#', icon: LayoutGrid, current: true },
    { label: 'Analyse', href: '#', icon: BarChart3, current: false },
    { label: 'Ma poche', href: '#', icon: Wallet, current: false },
    { label: 'Historique', href: '#', icon: History, current: false },
    { label: 'Tâches', href: '#', icon: CheckSquare, current: false },
    { label: 'Paramètres', href: '#', icon: Settings, current: false },
];

export const PROJECT_COLORS = {
    poulets: 'var(--b1)',
    oeufs: 'var(--b2)',
    revente: 'var(--b3)',
} as const;

export const demoProjects = [
    {
        name: 'Poulets de chair',
        href: '#',
        color: PROJECT_COLORS.poulets,
        current: true,
        recoveredLabel: '73 %',
        recoveredColor: 'var(--pos)',
    },
    {
        name: 'Revente en ligne',
        href: '#',
        color: PROJECT_COLORS.revente,
        current: false,
        recoveredLabel: '84 %',
        recoveredColor: 'var(--warn)',
    },
    {
        name: 'Œufs (pondeuses)',
        href: '#',
        color: PROJECT_COLORS.oeufs,
        current: false,
        recoveredLabel: '0 %',
        recoveredColor: 'var(--primary-text)',
    },
];

export default function AppLayout({
    headTitle,
    mainTitle,
    children,
}: {
    headTitle?: string;
    mainTitle: string;
    children: ReactNode;
}) {
    return (
        <>
            <Head title={headTitle} />
            
            <Section title={mainTitle}>
                <div className="flex gap-4 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow)]">
                    <NavSidebar
                        navItems={NAV_ITEMS}
                        projects={demoProjects}
                        newProjectHref={project.create().url}
                        activeTimer={{
                            projectName: 'Poulets de chair',
                            elapsedLabel: '00:42:10',
                            onStop: () => {},
                        }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <TopBar
                            syncLabel="Synchronisé · il y a 2 min"
                            onNoteEntry={() => {}}
                        />
                        <div className="flex flex-col gap-6 p-6">
                            <PageHeader
                                eyebrow="samedi 10 octobre · 3 projets actifs"
                                title={mainTitle}
                                actions={
                                    <Button variant="outline">
                                        Exporter CSV
                                    </Button>
                                }
                            />
                            { children }
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );

}