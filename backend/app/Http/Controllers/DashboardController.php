<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): App\Http\Controllers\RedirectResponse|Response
    {
        return Inertia::render('dashboard/index');
    }
}
