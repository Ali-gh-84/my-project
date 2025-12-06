import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.body instanceof FormData) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    })
  );
};
