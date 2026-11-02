import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

const THIN_SPACE = ' ';

export function formatAmount(amount: number, currency: string): string {
    const grouped = Math.round(Math.abs(amount))
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);

    return currency === 'MGA'
        ? `${grouped}${THIN_SPACE}Ar`
        : `${grouped}${THIN_SPACE}${currency}`;
}

export function formatDate(iso: string): string {
    if (!iso) {
        return '—';
    }

    const date = new Date(`${iso}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function goalUnitLabel(goalType: string, currency: string): string {
    switch (goalType) {
        case 'capital_recovery':
        case 'margin_target':
            return currency === 'MGA' ? 'Ar' : currency;
        case 'loss_limit':
            return '%';
        default:
            return 'unités';
    }
}
