import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { OidcSecurityService as OidcService } from "angular-auth-oidc-client";
import { Observable } from "rxjs";
import { switchMap, take } from "rxjs/operators";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private oidc: OidcService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const shouldAttach = req.url.startsWith('/api/');
    if (!shouldAttach) {
      return next.handle(req);
    }

    return this.oidc.getAccessToken().pipe(
      take(1),
      switchMap((token) => {
        if (token) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
        }
        return next.handle(req);
      })
    );
  }
}
