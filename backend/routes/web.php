<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->to(auth()->check() ? route('dashboard') : route('login')))
    ->name('home');

// Placeholder landing page for authenticated users — replaced by the real
// dashboard once the Project/Finance/Analytics domains are rebuilt.
Route::middleware(['auth', 'verified'])
    ->get('dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

if (app()->environment('local')) {
    Route::inertia('_dev/ui', 'dev/ui')->name('dev.ui');
}
