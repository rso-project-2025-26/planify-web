import { environment } from "@environments/environment";
import { OpenIdConfiguration } from "angular-auth-oidc-client";

export const authConfig: OpenIdConfiguration = {
  authority: `${environment.keycloakUrl}/realms/${environment.keycloakRealm}`,
	redirectUrl: window.location.origin,
	postLogoutRedirectUri: window.location.origin,
	clientId: environment.keycloakClientId,
	responseType: "code",
	scope: "openid profile email",
	silentRenew: false,
	useRefreshToken: true,
	maxIdTokenIatOffsetAllowedInSeconds: 600,
	triggerAuthorizationResultEvent: true,
	disablePkce: true,  // Disable PKCE for HTTP
};
