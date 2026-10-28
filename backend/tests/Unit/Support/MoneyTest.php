<?php

use App\Support\Money;

test('major units are converted with the currency exponent', function () {
    expect(Money::fromMajorUnits(1500, 'MGA')->amount)->toBe(1500)
        ->and(Money::fromMajorUnits(12.34, 'EUR')->amount)->toBe(1234);
});

test('an unsupported currency is rejected instead of guessing its decimals', function () {
    Money::fromMajorUnits(100, 'JPY');
})->throws(ValueError::class);
