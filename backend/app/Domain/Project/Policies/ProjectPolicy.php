<?php

namespace App\Domain\Project\Policies;

use App\Domain\Identity\Models\User;
use App\Domain\Project\Models\Project;

class ProjectPolicy
{
    public function view(User $user, Project $project): bool
    {
        return $user->organization_id === $project->organization_id;
    }

    /**
     * Only an owner or manager can create projects (CLAUDE.md rule 7) — `entry`
     * and `viewer` are denied.
     */
    public function create(User $user): bool
    {
        return $user->role?->canManageProjects() ?? false;
    }
}
