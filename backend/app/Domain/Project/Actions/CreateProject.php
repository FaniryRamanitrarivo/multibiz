<?php

namespace App\Domain\Project\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Data\ProjectData;
use App\Domain\Project\Models\Project;
use App\Support\Money;

/**
 * Creates a project owned by the acting user's organization.
 */
class CreateProject
{
    public function handle(User $user, ProjectData $data): Project
    {
        $currency = $user->organization->currency->value;

        // organization_id and created_by aren't mass-assignable (see Project's
        // #[Fillable]) — the relation sets organization_id, created_by is set
        // directly, same convention as CreateOrganization::handle.
        $project = $user->organization->projects()->make([
            'name' => $data->name,
            'project_template' => $data->projectTemplate,
            'graph_color' => $data->graphColor,
            'started_on' => $data->startedOn,
            'seed_budget' => Money::fromMajorUnits($data->seedBudget, $currency)->amount,
            'goal_type' => $data->goalType,
            'goal_target' => $this->goalTargetInStorageUnits($data, $currency),
            'goal_due_on' => $data->goalDueOn,
            'modules' => $data->modules,
        ]);

        $project->created_by = $user->id;
        $project->save();

        return $project;
    }

    private function goalTargetInStorageUnits(ProjectData $data, string $currency): int
    {
        return $data->goalType->isMonetary()
            ? Money::fromMajorUnits($data->goalTarget, $currency)->amount
            : (int) round($data->goalTarget);
    }
}
