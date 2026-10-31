<?php

namespace App\Http\Requests;

use App\Domain\Project\Enums\ProjectColor;
use App\Domain\Project\Enums\ProjectGoalType;
use App\Domain\Project\Enums\ProjectModule;
use App\Domain\Project\Enums\ProjectTemplate;
use App\Domain\Project\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectRequest extends FormRequest
{
    /**
     * Only an owner or manager can create projects — see `ProjectPolicy`.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Project::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $goalTarget = ['required', 'numeric', 'min:0'];

        if ($this->input('goal_type') === ProjectGoalType::LOSS_LIMIT->value) {
            $goalTarget[] = 'max:100';
        }

        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'project_template' => ['required', Rule::enum(ProjectTemplate::class)],
            'graph_color' => [
                'required',
                Rule::enum(ProjectColor::class),
                Rule::unique('projects', 'graph_color')
                    ->where('organization_id', $this->user()?->organization_id),
            ],
            'started_on' => ['required', 'date'],
            'seed_budget' => ['required', 'numeric', 'min:0'],
            'goal_type' => ['required', Rule::enum(ProjectGoalType::class)],
            'goal_target' => $goalTarget,
            'goal_due_on' => ['required', 'date', 'after:started_on'],
            'modules' => ['present', 'array'],
            'modules.*' => [Rule::enum(ProjectModule::class)],
        ];
    }
}
