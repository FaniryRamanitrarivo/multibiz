<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class DashboardController extends Controller
{
    public function index(): RedirectResponse | Response
    {
        return Inertia::render('dashboard/index');
    }
}
