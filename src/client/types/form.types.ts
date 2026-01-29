export type FieldType =
  | 'TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'TEXTAREA'
  | 'SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DATE';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type EventType =
  | 'FORM_VIEW'
  | 'FORM_START'
  | 'STEP_COMPLETE'
  | 'FORM_SUBMIT'
  | 'FORM_ABANDON';

export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  settings: FormSettings;
  steps: FormStep[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface FormStep {
  id: string;
  title: string;
  description: string | null;
  order: number;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  order: number;
  options: FieldOption[] | null;
  validation: FieldValidation | null;
  config: Record<string, unknown> | null;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FormSettings {
  primaryColor?: string;
  successMessage?: string;
  redirectUrl?: string;
}
