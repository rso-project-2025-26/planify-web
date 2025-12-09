import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "./auth.service";
import { map } from "rxjs";

export const authGuard = (requiredRoles: string[]): CanActivateFn => {
	return () => {
		const auth = inject(AuthService);

		return auth.user$.pipe(
			map((user) => {
				const claims = user?.userData;
        const roles = claims?.realm_access?.roles || [];
        return requiredRoles.some(r => roles.includes(r));
			})
		);
	};
};
