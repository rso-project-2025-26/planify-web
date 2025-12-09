import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "./auth.service";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
	const auth = inject(AuthService);
	const token = auth.getAccessToken();

	if (token) {
		req = req.clone({
			setHeaders: { Authorization: `Bearer ${token}` },
		});
	}

	return next(req);
};
