<?php

namespace App\Http\Controllers;

use App\Domain\Organization\Models\Organization;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard/index');
    }
}
