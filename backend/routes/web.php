<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->to(auth()->check() ? route('dashboard') : route('login')))
    ->name('home');

// Placeholder landing page for authenticated users — replaced by the real
// dashboard once the Project/Finance/Analytics domains are rebuilt.
Route::middleware(['auth', 'verified'])->group(function () {

    Route::middleware('check-user-organization')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');
    });

    // Onboarding: only for users who don't have an organization yet.
    Route::middleware('user-without-organization')->group(function () {
        Route::get('/organization/create', [OrganizationController::class, 'create'])
            ->name('organization.create');

        Route::post('/organization/store', [OrganizationController::class, 'store'])
            ->name('organization.store');
    });
});

if (app()->environment('local')) {
    Route::inertia('_dev/ui', 'dev/ui')->name('dev.ui');
}
