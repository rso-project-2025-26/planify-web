import { ApplicationConfig } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideAuth } from "angular-auth-oidc-client";
import { authConfig } from "./auth/keycloak.config";

export const appConfig: ApplicationConfig = {
  providers: [
    // Using class-based HTTP_INTERCEPTORS registration in AppModule
    provideHttpClient(),

    provideAuth({
      config: authConfig,
    }),
  ],
};
