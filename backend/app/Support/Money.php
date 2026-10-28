<?php

namespace App\Support;

use App\Domain\Organization\Enums\Currency;
use InvalidArgumentException;
use JsonSerializable;

/**
 * An amount of money, stored as an integer in the currency's minor unit — never a
 * float. See docs/adr/0005-money-as-integers.md.
 */
final readonly class Money implements JsonSerializable
{
    public function __construct(
        public int $amount,
        public string $currency = 'MGA',
    ) {}

    public static function fromMajorUnits(float $amount, string $currency = 'MGA'): self
    {
        return new self((int) round($amount * (10 ** self::exponent($currency))), $currency);
    }

    public function add(self $other): self
    {
        return new self($this->amount + $this->amountInSameCurrency($other), $this->currency);
    }

    public function subtract(self $other): self
    {
        return new self($this->amount - $this->amountInSameCurrency($other), $this->currency);
    }

    public function equals(self $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function toMajorUnits(): float
    {
        return $this->amount / (10 ** self::exponent($this->currency));
    }

    /**
     * French-style formatting, e.g. "1 250 000 Ar" for MGA.
     */
    public function format(): string
    {
        $decimals = self::exponent($this->currency);
        $formatted = number_format($this->toMajorUnits(), $decimals, ',', ' ');

        return match ($this->currency) {
            'MGA' => "{$formatted} Ar",
            default => "{$formatted} {$this->currency}",
        };
    }

    private function amountInSameCurrency(self $other): int
    {
        if ($other->currency !== $this->currency) {
            throw new InvalidArgumentException("Cannot combine {$this->currency} with {$other->currency}.");
        }

        return $other->amount;
    }

    /**
     * Number of minor-unit digits, from the `Currency` enum. An unsupported code
     * throws (`ValueError`) rather than guessing a number of decimals.
     */
    private static function exponent(string $currency): int
    {
        return Currency::from($currency)->exponent();
    }

    /**
     * @return array{amount: int, currency: string}
     */
    public function jsonSerialize(): array
    {
        return ['amount' => $this->amount, 'currency' => $this->currency];
    }
}
