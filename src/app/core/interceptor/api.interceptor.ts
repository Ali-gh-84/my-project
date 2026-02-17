import {HttpInterceptorFn, HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {NzMessageService} from 'ng-zorro-antd/message';
import {catchError, throwError} from 'rxjs';

let sessionExpiredHandled = false;

export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const message = inject(NzMessageService);

  const accessToken = localStorage.getItem('accessToken');

  const modifiedReq = req.clone({
    setHeaders: {
      'accept-language': 'fa-IR',
      ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {})
    }
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      const msg = error?.error?.message;

      const isSessionExpired =
        error.status === 401 ||
        msg === 'لطفا مجددا وارد برنامه شوید';

      if (isSessionExpired && !sessionExpiredHandled) {
        sessionExpiredHandled = true;

        localStorage.clear();

        message.error('لطفا مجددا وارد برنامه شوید');

        const currentUrl = router.url;
        if (currentUrl && currentUrl !== '/') {
          localStorage.setItem('intendedUrl', currentUrl);
        }

        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};
