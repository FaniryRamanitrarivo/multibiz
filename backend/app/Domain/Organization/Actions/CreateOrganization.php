<?php

namespace App\Domain\Organization\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Organization\Data\OrganizationData;
use App\Domain\Organization\Enums\Role;
use App\Domain\Organization\Models\Organization;

/**
 * Creates an organization and makes the acting user its owner.
 */
class CreateOrganization
{
    public function handle(User $user, OrganizationData $data): Organization
    {
        $organization = Organization::create($data->toArray());

        // role isn't mass-assignable on User; users()->save() sets organization_id.
        $user->role = Role::Owner;
        $organization->users()->save($user);

        return $organization;
    }
}
