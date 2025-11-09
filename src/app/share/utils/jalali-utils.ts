export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = 0;

  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  if (gm > 2 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)) {
    days += 1;
  }

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return [jy, jm, jd];
}

export function formatJalaliDate(date: Date): string {
  const [year, month, day] = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

export function toPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  let gy = 0;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = -399;
    jy += 621;
  }

  const gy2 = jm > 2 ? jy + 1 : jy;
  let days =
    -1461 * Math.floor(jy / 4) +
    1461 * Math.floor((gy2 + 3) / 4) -
    1461 * Math.floor((gy2 + 99) / 100) +
    1461 * Math.floor((gy2 + 399) / 400) +
    jd +
    (jm > 6 ? 30 * (jm - 7) + 6 : 31 * (jm - 1)) +
    79;

  if (jm > 2 && ((gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0)) {
    days += 1;
  }

  const sal_a = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days >= 366) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const gd = days + 1;
  const gmIndex = sal_a.findIndex(s => gd <= s);
  const gm = gmIndex >= 0 ? gmIndex : 11;

  return new Date(gy, gm, gd);
}

export function jalaliStringToDate(jalaliStr: string): Date | null {
  if (!jalaliStr || jalaliStr.length !== 8) return null;

  const y = +jalaliStr.substring(0, 4);
  const m = +jalaliStr.substring(4, 6);
  const d = +jalaliStr.substring(6, 8);

  return jalaliToGregorian(y, m, d);
}
