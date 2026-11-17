<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response | RedirectResponse
    {

        if (!auth()->user()?->organization?->projects()->exists()) {
            return redirect()->route('projects.create');
        }

        return Inertia::render('dashboard/index');
    }
}
