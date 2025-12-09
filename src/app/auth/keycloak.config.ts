import { environment } from "@environments/environment";
import { OpenIdConfiguration } from "angular-auth-oidc-client";

export const authConfig: OpenIdConfiguration = {
  authority: `${environment.keycloakUrl}/realms/${environment.keycloakRealm}`,
	redirectUrl: window.location.origin,
  postLogoutRedirectUri: window.location.origin,
	clientId: environment.keycloakClientId,
	responseType: "code",
	scope: "openid profile email",
	silentRenew: true,
	useRefreshToken: true,
};
