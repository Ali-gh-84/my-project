import { Pipe, PipeTransform } from '@angular/core';
import {formatJalaliDate, toPersianDigits} from '../utils/jalali-utils';

@Pipe({
  name: 'jalaliDateFa'
})
export class JalaliDateFaPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    const jalali = formatJalaliDate(date);

    return toPersianDigits(jalali);
  }
}
