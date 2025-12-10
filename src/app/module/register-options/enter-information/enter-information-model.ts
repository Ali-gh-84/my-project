export interface FieldConfig {
  controlName: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date' | 'checkbox-group';
  required?: boolean;
  placeholder?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  options?: { value: any; label: string }[];
  groupName?: string;
}

export interface CityCountry {
  id: string | number;
  name: string;
}

export interface dataKeep {
  nationalCode: string,
  jalaliBirthDate?: string
}

export enum SeminaryDegreeSSOT {
  Level2 = 1,
  Level3 = 2,
  Level4 = 3
}

export const SeminaryDegreeSSOTMeta = {
  [SeminaryDegreeSSOT.Level2]: {
    value: 'Level2',
    display: 'سطح 2'
  },
  [SeminaryDegreeSSOT.Level3]: {
    value: 'Level3',
    display: 'سطح 3'
  },
  [SeminaryDegreeSSOT.Level4]: {
    value: 'Level4',
    display: 'سطح 4'
  }
} as const;

export enum UniversityDegreeSSOT {
  Associate = 1,
  Bachelor = 2,
  Master = 3,
  Doctorate = 4
}

export const UniversityDegreeSSOTMeta = {
  [UniversityDegreeSSOT.Associate]: {
    value: 'Associate',
    display: 'کاردانی'
  },
  [UniversityDegreeSSOT.Bachelor]: {
    value: 'Bachelor',
    display: 'کارشناسی'
  },
  [UniversityDegreeSSOT.Master]: {
    value: 'Master',
    display: 'کارشناسی ارشد'
  },
  [UniversityDegreeSSOT.Doctorate]: {
    value: 'Doctorate',
    display: 'دکتری'
  }
} as const;
