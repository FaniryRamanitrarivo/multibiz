<?php

namespace App\Domain\Project\Policies;

use App\Domain\Identity\Models\User;

class ProjectPolicy
{
    /**
     * Only an owner or manager can create projects (CLAUDE.md rule 7) — `entry`
     * and `viewer` are denied.
     */
    public function create(User $user): bool
    {
        return $user->role?->canManageProjects() ?? false;
    }
}
