import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {from, switchMap, throwError} from 'rxjs';
import {urls} from '../../configs/urls';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (e) {
    return true;
  }
}

function refreshAccessToken(refreshToken: string) {
  const http = inject(HttpClient);
  return http.post<any>(urls.auth.refreshToken, {refresh_token: refreshToken});
}

export const jwtTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authData = localStorage.getItem('JWT');
  const parsedAuthData = authData ? JSON.parse(authData) : null;
  const accessToken = parsedAuthData?.access_token;
  const refreshToken = parsedAuthData?.refresh_token;

  const isAuthRequest = req.url.endsWith('/api/login') || req.url.endsWith('/api/register') || req.url.endsWith('/api/refresh');

  if (!accessToken || isAuthRequest) {
    return next(req);
  }

  if (!isTokenExpired(accessToken)) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return next(cloned);
  } else if (refreshToken) {

    return from(refreshAccessToken(refreshToken)).pipe(
      switchMap((response) => {

        localStorage.setItem('JWT', JSON.stringify(response));

        const newAccessToken = response.access_token;

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newAccessToken}`
          }
        });

        return next(cloned);
      })
    );
  } else {
    return throwError(() => new Error('Authentication required'));
  }
};
