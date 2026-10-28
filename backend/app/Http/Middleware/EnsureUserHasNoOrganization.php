<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Inverse of EnsureUserHasOrganization (like `guest` for `auth`): keeps the
 * organization onboarding for users who don't have one yet.
 */
class EnsureUserHasNoOrganization
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->user()->organization_id) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
