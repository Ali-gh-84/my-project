export interface FieldConfig {
  controlName: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'date' | 'checkbox-group';
  required?: boolean;
  placeholder?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  options?: { value: any; label: string }[]; // برای select و checkbox-group
  groupName?: string; // برای checkbox-group، مثلاً 'scores'
}

export interface CityCountry {
  id: string | number;
  name: string;
}
