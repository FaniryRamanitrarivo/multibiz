<?php

use App\Domain\Organization\Enums\Currency;

test('currencies without an everyday subdivision have no minor-unit digits', function () {
    expect(Currency::MGA->exponent())->toBe(0)
        ->and(Currency::XOF->exponent())->toBe(0)
        ->and(Currency::EUR->exponent())->toBe(2)
        ->and(Currency::USD->exponent())->toBe(2);
});

test('options list every currency as a value/label pair', function () {
    expect(Currency::options())
        ->toHaveCount(count(Currency::cases()))
        ->toContain(['value' => 'MGA', 'label' => 'Ariary (MGA)']);
});
