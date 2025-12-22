import {environmentToEhraz} from '../../environments/environment';
import {CanActivateFn} from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const accessToken = localStorage.getItem('accessToken');
  const expiresAtStr = localStorage.getItem('expiresAt');

  if (accessToken && expiresAtStr) {
    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();

    if (now < expiresAt) {
      return true;
    }
  }

  localStorage.setItem('intendedUrl', state.url);

  localStorage.removeItem('accessToken');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('userId');

  window.location.href = environmentToEhraz.apiUrl;
  return false;
};
