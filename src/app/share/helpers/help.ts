import {AbstractControl, ValidationErrors} from '@angular/forms';

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

