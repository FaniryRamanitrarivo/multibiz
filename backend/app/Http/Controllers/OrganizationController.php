<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    
    public function create()
    {
        return Inertia::render('organization/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $organization = auth()->user()->organizations()->create([
            'name' => $request->input('name'),
        ]);

        auth()->user()->update(['organization_id' => $organization->id]);

        return redirect()->route('dashboard');
    }

}
