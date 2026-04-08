import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/v1/auth/')) {
    return next(req);
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimationsAsync()
  ]
};
