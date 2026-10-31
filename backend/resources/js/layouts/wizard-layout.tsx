import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

export type WizardStep = {
    label: string;
    status: 'done' | 'current' | 'upcoming';
};

export default function WizardLayout({
    eyebrow,
    title,
    subtitle,
    steps,
    onSelectStep,
    children,
}: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    steps?: WizardStep[];
    // Kept out of each WizardStep so `steps` stays plain, JSON-like data —
    // setLayoutProps deep-equality-checks the props it's given, and a fresh
    // per-item closure on every render would never compare equal, causing an
    // infinite render loop. One stable callback (e.g. the `setStep` from
    // useState, never a fresh closure) covers every step instead.
    onSelectStep?: (step: number) => void;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-dvh flex-col bg-bg text-text">
            <Head title={title} />

            <header className="flex flex-wrap items-center gap-3.5 border-b border-border bg-surface px-9 py-3.5">
                <Link
                    href={dashboard()}
                    className="flex items-center gap-2.5 text-text no-underline"
                >
                    <span className="num grid size-8 place-items-center rounded-[9px] bg-primary text-sm font-medium text-white">
                        mb
                    </span>
                    <span className="text-lg font-bold tracking-[-0.02em]">
                        MultiBiz
                    </span>
                </Link>
                <span aria-hidden="true" className="h-5.5 w-px bg-border" />
                <span className="text-[14.5px] font-semibold text-text2">
                    Nouveau projet
                </span>
                <ThemeToggle className="ml-auto" />
                <Link
                    href={dashboard()}
                    className="flex h-10 items-center rounded-[10px] border border-border px-3.5 text-sm font-semibold text-text no-underline"
                >
                    Annuler
                </Link>
            </header>

            <div className="dot-grid flex-1 px-9 py-8">
                <div className="mx-auto flex max-w-[1180px] flex-col gap-6.5">
                    <div className="flex flex-wrap items-end justify-between gap-5">
                        <div className="flex flex-col gap-2">
                            {eyebrow && (
                                <span className="num text-[12.5px] text-primary-text">
                                    {eyebrow}
                                </span>
                            )}
                            <h1 className="m-0 text-[32px] leading-[1.15] font-bold tracking-[-0.03em]">
                                {title}
                            </h1>
                            {subtitle && (
                                <span className="max-w-[620px] text-[14.5px] leading-relaxed text-muted">
                                    {subtitle}
                                </span>
                            )}
                        </div>

                        {steps && steps.length > 0 && (
                            <ol
                                aria-label="Étapes"
                                className="m-0 flex list-none items-center gap-2 p-0"
                            >
                                {steps.map((step, index) => (
                                    <li
                                        key={step.label}
                                        className="flex items-center gap-2"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onSelectStep?.(index + 1)
                                            }
                                            aria-current={
                                                step.status === 'current'
                                                    ? 'step'
                                                    : undefined
                                            }
                                            className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pr-3 pl-1.5"
                                        >
                                            <span
                                                className={cn(
                                                    'num grid size-6.5 place-items-center rounded-full text-[12.5px] font-medium',
                                                    step.status === 'current' &&
                                                        'bg-primary text-white',
                                                    step.status === 'done' &&
                                                        'bg-pos-soft text-pos',
                                                    step.status ===
                                                        'upcoming' &&
                                                        'bg-surface2 text-muted',
                                                )}
                                            >
                                                {step.status === 'done' ? (
                                                    <Check className="size-3.5" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-[13.5px] font-semibold',
                                                    step.status === 'current'
                                                        ? 'text-text'
                                                        : 'text-muted',
                                                )}
                                            >
                                                {step.label}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
