<?php

namespace App\Http\Controllers;

use App\Domain\Project\Actions\CreateProject;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectModule;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;
use App\Http\Requests\ProjectRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function create(): Response
    {
        Gate::authorize('create', Project::class);

        $user = auth()->user();

        $takenColors = Project::where('organization_id', $user->organization_id)
            ->get()
            ->map(fn (Project $project) => $project->graph_color->value)
            ->all();

        return Inertia::render('projects/create', [
            'templates' => ProjectTemplate::definitions(),
            'colors' => ProjectColor::options(),
            'takenColors' => $takenColors,
            'goalTypes' => ProjectGoalType::options(),
            'modules' => ProjectModule::catalog(),
            'currency' => $user->organization->currency->value,
        ]);
    }

    public function store(ProjectRequest $request, CreateProject $createProject): RedirectResponse
    {
        $createProject->handle($request->user(), ProjectData::from($request->validated()));

        return redirect()->route('dashboard');
    }
}
