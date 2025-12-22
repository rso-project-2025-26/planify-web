import {Injectable} from "@angular/core";
import {RegisterRequest, RegisterResponse} from "@core/models/auth.model";
import {OidcSecurityService as OidcService} from "angular-auth-oidc-client";
import {HttpClient} from '@angular/common/http';
import {combineLatest, Observable, of} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {environment} from '@environments/environment';

@Injectable({ providedIn: "root" })
export class AuthService {
	constructor(private oidc: OidcService, private http: HttpClient) {
    //this.oidc.checkAuth().subscribe();
  }
	user$ = this.oidc.userData$;
	isAuthenticated$ = this.oidc.isAuthenticated$.pipe(
    map((res: any) => !!(res && (res.isAuthenticated ?? res)))
  );
  private userServiceUrl = `${environment.userServiceUrl}/auth`;

	roles$ = this.isAuthenticated$.pipe(
		// Če uporabnik ni prijavljen -> prazen seznam vlog
		// če je prijavljen -> preberemo token in ga dekodiramo
		switchMap(isAuth => {
			if (!isAuth) return of([] as string[]);
			return this.oidc.getAccessToken().pipe(
				map((token) => {
					const payload = this.safeDecodeJwt(token);
					return this.extractRealmRoles(payload);
				})
			);
		})
	);

  effectiveRoles$ = combineLatest([this.roles$]).pipe(
    map(([tokenRoles]) => {
      if ((tokenRoles?.length ?? 0) > 0) return tokenRoles;
      return [];
    })
  );

  login() {
		this.oidc.authorize();
	}

	logout() {
		this.oidc.logoffAndRevokeTokens().subscribe();
	}

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.userServiceUrl}/register`, request);
  }

  hasAnyRole(required: string[]): Observable<boolean> {
    return this.effectiveRoles$.pipe(
      map((roles) => required.some((r) => roles?.includes(r)))
    );
  }

  private safeDecodeJwt(token: string): any {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  private extractRealmRoles(claims: any): string[] {
    if (!claims) return [];
    const roles = claims?.realm_access?.roles;
    if (Array.isArray(roles)) return roles as string[];
    return [];
  }
}
