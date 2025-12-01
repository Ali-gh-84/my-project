import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function isValidNationalCode(control: AbstractControl): ValidationErrors | null {
  const nationalCode = control.value;

  if (!nationalCode) return null;

  let code = nationalCode.toString();
  const codeLength = code.length;
  const notAllowedNationalCode = {
    '0000000000': true,
    '2222222222': true,
    '3333333333': true,
    '4444444444': true,
    '5555555555': true,
    '6666666666': true,
    '7777777777': true,
    '8888888888': true,
    '9999999999': true
  };

  if (code in notAllowedNationalCode) return {nationalCodeInvalid: true};
  if (codeLength < 8 || codeLength > 10) return {nationalCodeInvalid: true};
  code = ('00' + code).substring(codeLength + 2 - 10);
  if (+code.substring(3, 9) === 0) return {nationalCodeInvalid: true};

  const lastNumber = +code.substring(9);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += +code.substring(i, i + 1) * (10 - i);
  }

  sum = sum % 11;

  const isValid =
    (sum < 2 && lastNumber === sum) || (sum >= 2 && lastNumber === 11 - sum);

  return isValid ? null : {nationalCodeInvalid: true};
}

export function isValidPhoneNumber(control: AbstractControl): ValidationErrors | null {
  const phoneNumber = String(control.value || '').trim();
  const generalRegex = /^((\+98|0)9\d{9})$/;
  const isValid = generalRegex.test(phoneNumber);
  return isValid ? null : {phoneNumberInvalid: true};
}

export function maxAgeValidator(maxAge: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || !maxAge || maxAge <= 0) return null;

    let year: number, month: number, day: number;

    const value = control.value.toString().trim();

    if (value.length === 8 && /^\d{8}$/.test(value)) {
      year = +value.substring(0, 4);
      month = +value.substring(4, 6);
      day = +value.substring(6, 8);
    } else if (value.includes('/') || value.includes('-')) {
      const parts = value.replace(/-/g, '/').split('/');
      if (parts.length !== 3) return null;
      year = +parts[0];
      month = +parts[1];
      day = +parts[2];
    } else {
      return null;
    }

    if (year < 1300 || year > 1405 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const today = new Date();
    const currentJalaliYear = today.getFullYear() - 621;
    let age = currentJalaliYear - year;

    const nowMonth = today.getMonth() + 1;
    const nowDay = today.getDate();
    if (nowMonth < month || (nowMonth === month && nowDay < day)) {
      age--;
    }
    console.log('age is : ', age)

    return age < maxAge ? null : {maxAge: {requiredMax: maxAge, actualAge: age}};
  };
}
