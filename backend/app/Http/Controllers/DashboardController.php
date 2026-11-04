<?php

namespace App\Http\Controllers;

use App\Domain\Organization\Models\Organization;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        dd(auth()->user()->organization->projects()->get());
        return Inertia::render('dashboard/index');
    }
}
