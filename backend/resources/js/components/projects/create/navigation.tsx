import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type WizardNavigationProps = {
    step: number;
    canContinue: boolean;
    processing: boolean;
    projectName: string;
    onPrevious: () => void;
    onNext: () => void;
    onCreate: () => void;
};

export function WizardNavigation({
    step,
    canContinue,
    processing,
    projectName,
    onPrevious,
    onNext,
    onCreate,
}: WizardNavigationProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4.5">
            <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={onPrevious}
            >
                ← Retour
            </Button>
            {step < 3 ? (
                <Button type="button" disabled={!canContinue} onClick={onNext}>
                    Continuer
                </Button>
            ) : (
                <Button
                    type="button"
                    disabled={!canContinue || processing}
                    onClick={onCreate}
                    className="gap-2"
                >
                    {processing && <Spinner />}
                    Créer « {projectName} »
                </Button>
            )}
        </div>
    );
}
