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
use App\Support\Money;
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
        $project = $createProject->handle(
            $request->user(),
            ProjectData::from($request->validated()),
        );

        return redirect()->route('projects.show', $project);
    }

    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        $project->loadMissing(['creator', 'organization']);
        $currency = $project->organization->currency->value;
        $goalType = $project->goal_type;

        return Inertia::render('projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'color' => 'var(--'.$project->graph_color->value.')',
                'status' => $project->status->value,
                'statusLabel' => $project->status->label(),
                'template' => $project->project_template->value,
                'templateLabel' => $project->project_template->label(),
                'startedOn' => $project->started_on->toDateString(),
                'seedBudget' => (new Money(
                    $project->seed_budget,
                    $currency,
                ))->toMajorUnits(),
                'goalType' => $goalType->value,
                'goalTypeLabel' => $goalType->label(),
                'goalTarget' => $goalType->isMonetary()
                    ? (new Money($project->goal_target, $currency))->toMajorUnits()
                    : $project->goal_target,
                'goalDueOn' => $project->goal_due_on->toDateString(),
                'modules' => $project->modules,
                'currencyExponent' => $project->organization->currency->exponent(),
                'moduleLabels' => collect(ProjectModule::catalog())
                    ->filter(fn (array $module) => in_array(
                        $module['value'],
                        $project->modules,
                        true,
                    ))
                    ->map(fn (array $module) => $module['label'])
                    ->values()
                    ->all(),
                'currency' => $currency,
                'creator' => $project->creator
                    ? ['id' => $project->creator->id, 'name' => $project->creator->name]
                    : null,
            ],
            'tabs' => [[
                'label' => 'Vue d’ensemble',
                'href' => route('projects.show', $project),
                'current' => true,
            ]],
        ]);
    }
}
