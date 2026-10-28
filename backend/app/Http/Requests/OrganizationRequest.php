<?php

namespace App\Http\Requests;

use App\Domain\Organization\Enums\Currency;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrganizationRequest extends FormRequest
{
    /**
     * A user belongs to a single organization: one who already has one can't
     * create another (and silently lose access to the first).
     */
    public function authorize(): bool
    {
        return $this->user()?->organization_id === null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            // all_with_bc: the browser's Intl list includes IANA backward-compat
            // aliases (e.g. Asia/Calcutta) that plain `timezone` rejects.
            'timezone' => ['required', 'timezone:all_with_bc'],
            'currency' => ['required', Rule::enum(Currency::class)],
        ];
    }
}
