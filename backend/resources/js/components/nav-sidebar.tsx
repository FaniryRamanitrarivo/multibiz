import { Link } from '@inertiajs/react';
import { Plus, Square, type LucideIcon } from 'lucide-react';

import { ProjectDot } from '@/components/ui/project-avatar';
import { cn } from '@/lib/utils';

export type NavItem = {
    label: string;
    href: string;
    icon: LucideIcon;
    current: boolean;
};

export type ProjectNavItem = {
    name: string;
    href: string;
    color: string;
    current: boolean;
    recoveredLabel: string;
    recoveredColor: string;
};

export type ActiveTimer = {
    projectName: string;
    elapsedLabel: string;
    onStop: () => void;
};

function NavSidebar({
    navItems,
    projects,
    newProjectHref,
    activeTimer,
    className,
}: {
    navItems: NavItem[];
    projects: ProjectNavItem[];
    newProjectHref: string;
    activeTimer?: ActiveTimer;
    className?: string;
}) {
    return (
        <nav
            aria-label="Navigation principale"
            className={cn(
                'flex w-60 shrink-0 flex-col gap-5.5 border-r border-border bg-surface px-3.5 py-[22px]',
                className,
            )}
        >
            <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-2.5 text-text no-underline"
            >
                <span className="num grid size-8 place-items-center rounded-[9px] bg-primary text-sm font-medium text-white">
                    mb
                </span>
                <span className="text-lg font-bold tracking-[-0.02em]">
                    MultiBiz
                </span>
            </Link>

            <div className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={cn(
                            'flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[14.5px] no-underline',
                            item.current
                                ? 'bg-primary-soft font-semibold text-primary-text'
                                : 'text-text2 hover:bg-surface2',
                        )}
                    >
                        <item.icon
                            aria-hidden="true"
                            className="size-[18px] stroke-[1.8]"
                        />
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between px-3 pb-1.5">
                    <span className="num text-[11.5px] text-muted">
                        // mes projets
                    </span>
                    <Link
                        href={newProjectHref}
                        aria-label="Nouveau projet"
                        className="flex size-6 items-center justify-center rounded-[7px] border border-border text-muted no-underline hover:bg-surface2"
                    >
                        <Plus className="size-3" strokeWidth={2.4} />
                    </Link>
                </div>
                {projects.map((project) => (
                    <Link
                        key={project.name}
                        href={project.href}
                        aria-current={project.current ? 'page' : undefined}
                        className={cn(
                            'flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[14.5px] no-underline',
                            project.current
                                ? 'bg-primary-soft font-semibold text-primary-text'
                                : 'text-text2 hover:bg-surface2',
                        )}
                    >
                        <ProjectDot color={project.color} />
                        <span className="min-w-0 flex-1 truncate">
                            {project.name}
                        </span>
                        <span
                            className="num text-xs"
                            style={{ color: project.recoveredColor }}
                        >
                            {project.recoveredLabel}
                        </span>
                    </Link>
                ))}
                <span className="px-3 pt-1.5 text-xs text-muted">
                    % du capital récupéré
                </span>
            </div>

            {activeTimer && (
                <div className="mt-auto flex flex-col gap-2.5 rounded-xl border border-border bg-bg p-3.5">
                    <span className="num flex items-center gap-1.5 text-[11.5px] text-muted">
                        <span className="size-1.5 rounded-full bg-neg" />
                        // chrono en cours
                    </span>
                    <span className="text-sm font-semibold">
                        {activeTimer.projectName}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                        <span className="num text-xl font-medium">
                            {activeTimer.elapsedLabel}
                        </span>
                        <button
                            type="button"
                            onClick={activeTimer.onStop}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] font-semibold"
                        >
                            <Square className="size-3" fill="currentColor" />
                            Arrêter
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export { NavSidebar };
