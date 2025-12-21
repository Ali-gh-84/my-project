import { HttpInterceptorFn } from '@angular/common/http';

export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedReq = req;

  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
        'accept-language': 'fa-IR'
      }
    });
  } else {
    modifiedReq = req.clone({
      setHeaders: {
        'accept-language': 'fa-IR'
      }
    });
  }

  return next(modifiedReq);
};


//
// export const ApiInterceptor: HttpInterceptorFn = (req, next) => {
//   const accessToken = localStorage.getItem('accessToken');
//
//   if (accessToken) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//   }
//
//   return next(req);
// };
