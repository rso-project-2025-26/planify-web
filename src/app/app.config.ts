import { ApplicationConfig } from "@angular/core";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAuth } from "angular-auth-oidc-client";
import { authConfig } from "./auth/keycloak.config";
import { tokenInterceptor } from "./auth/token.interceptor";

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withInterceptors([tokenInterceptor])),

		provideAuth({
			config: authConfig,
		}),
	],
};
