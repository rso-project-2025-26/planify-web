import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { OidcSecurityService as OidcService } from "angular-auth-oidc-client";
import { Observable } from "rxjs";
import { catchError, switchMap, take } from "rxjs/operators";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private oidc: OidcService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Bypass attaching token for public endpoints (registration, auth, org creation, etc.)
    const publicPaths = [
      '/api/auth/register',
    ];

    const isPublic = publicPaths.some((p) => req.url.startsWith(p));
    const shouldAttach = !isPublic && req.url.startsWith('/api/');
    if (!shouldAttach) {
      return next.handle(req);
    }

    return this.oidc.getAccessToken().pipe(
      take(1),
      switchMap((token) => {
        const authReq = token
          ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
          : req;
        return next.handle(authReq);
      }),
      // Never block the request if token retrieval fails for any reason
      catchError(() => next.handle(req))
    );
  }
}
