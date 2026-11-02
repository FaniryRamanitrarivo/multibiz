<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        dd($user->organization->projects()->get());
        return Inertia::render('dashboard/index');
    }
}
