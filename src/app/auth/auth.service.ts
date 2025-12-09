import { Injectable, computed } from "@angular/core";
import { RegisterRequest, RegisterResponse } from "@core/models/auth.model";
import { OidcSecurityService as OidcService } from "angular-auth-oidc-client";
import { HttpClient } from '@angular/common/http';
import { map, Observable } from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({ providedIn: "root" })
export class AuthService {
	constructor(private oidc: OidcService, private http: HttpClient) {
    this.oidc.checkAuth().subscribe();
  }
	user$ = this.oidc.userData$;
	isAuthenticated$ = this.oidc.isAuthenticated$.pipe(
    map((res: any) => !!(res && (res.isAuthenticated ?? res)))
  );
  private userServiceUrl = `${environment.userServiceUrl}/auth`;

	login() {
		this.oidc.authorize();
	}

	logout() {
		this.oidc.logoffAndRevokeTokens().subscribe();
	}

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.userServiceUrl}/register`, request);
  }

	getAccessToken(): string | null {
		let token: string | null = null;
		this.oidc.getAccessToken().subscribe((t) => (token = t));
		return token;
	}

}
