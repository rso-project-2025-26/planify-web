import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { map } from "rxjs";

export const authGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    return auth.hasAnyRole(requiredRoles).pipe(
      map((hasRole) => {
        if (hasRole) {
          return true;
        }
        // Redirect to login or unauthorized page
        return router.createUrlTree(['/events/public']);
      })
    );
  };
};
