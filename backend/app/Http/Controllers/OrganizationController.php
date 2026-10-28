<?php

namespace App\Http\Controllers;

use App\Domain\Organization\Actions\CreateOrganization;
use App\Domain\Organization\Data\OrganizationData;
use App\Domain\Organization\Enums\Currency;
use App\Http\Requests\OrganizationRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('organization/create', [
            'currencies' => Currency::options(),
        ]);
    }

    public function store(OrganizationRequest $request, CreateOrganization $createOrganization): RedirectResponse
    {
        $createOrganization->handle($request->user(), OrganizationData::from($request->validated()));

        return redirect()->route('dashboard');
    }
}
