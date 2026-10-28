<?php

namespace App\Domain\Organization\Enums;

/**
 * The currencies an organization can keep its books in. Single source of truth for
 * both the currency picker and `App\Support\Money`'s minor-unit exponents — a
 * currency missing here can't be chosen, so amounts are never stored with a
 * guessed number of decimals. See docs/adr/0005-money-as-integers.md.
 */
enum Currency: string
{
    case MGA = 'MGA';
    case XOF = 'XOF';
    case EUR = 'EUR';
    case USD = 'USD';

    /**
     * Number of minor-unit digits: amounts are stored as `amount * 10 ** exponent`.
     */
    public function exponent(): int
    {
        return match ($this) {
            self::MGA, self::XOF => 0,
            self::EUR, self::USD => 2,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::MGA => 'Ariary (MGA)',
            self::XOF => 'Franc CFA (XOF)',
            self::EUR => 'Euro (EUR)',
            self::USD => 'Dollar US (USD)',
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $currency) => ['value' => $currency->value, 'label' => $currency->label()],
            self::cases(),
        );
    }
}
