<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->to(auth()->check() ? route('dashboard') : route('login')))
    ->name('home');

// Placeholder landing page for authenticated users — replaced by the real
// dashboard once the Project/Finance/Analytics domains are rebuilt.
Route::middleware(['auth', 'verified', 'check-user-organization'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('/organization/create', [OrganizationController::class, 'create'])
        ->name('organization.create')
        ->withoutMiddleware(['check-user-organization']);
});

if (app()->environment('local')) {
    Route::inertia('_dev/ui', 'dev/ui')->name('dev.ui');
}
